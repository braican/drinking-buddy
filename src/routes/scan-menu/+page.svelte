<script lang="ts">
  import { BeerPlacard } from '@components';
  import type { BeerWithData, SearchResult, Brewery } from '@types';
  import { debounce } from '@utils';

  let imageFile: File | null = $state(null);
  let imagePreview: string | null = $state(null);
  let analyzing = $state(false);
  let extractedNames: string[] = $state([]);
  let matchedBeers: BeerWithData[] = $state([]);
  let error: string | null = $state(null);

  // Brewery filtering
  let breweryQuery = $state('');
  let selectedBrewery: Brewery | null = $state(null);
  let breweryResults: SearchResult[] = $state([]);
  let showBreweryResults = $state(false);

  async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    imageFile = file;
    imagePreview = URL.createObjectURL(file);
    extractedNames = [];
    matchedBeers = [];
    error = null;
  }

  const searchBreweries = debounce(async (query: string) => {
    if (query.length < 2) {
      breweryResults = [];
      return;
    }

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) return;

      const { data } = await response.json();
      breweryResults = data.breweryResults || [];
      showBreweryResults = true;
    } catch (err) {
      console.error('Error searching breweries:', err);
    }
  }, 300);

  async function selectBrewery(result: SearchResult) {
    // Fetch full brewery data to get the ID
    try {
      const response = await fetch(`/api/brewery?slug=${result.slug}`);
      if (!response.ok) return;

      const { data } = await response.json();
      selectedBrewery = data.brewery;
      breweryQuery = selectedBrewery.name;
      showBreweryResults = false;
      breweryResults = [];
    } catch (err) {
      console.error('Error fetching brewery:', err);
    }
  }

  function clearBrewery() {
    selectedBrewery = null;
    breweryQuery = '';
    breweryResults = [];
  }

  async function matchBeers() {
    if (!extractedNames.length) return;

    try {
      const matchResponse = await fetch('/api/menu/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beerNames: extractedNames,
          breweryId: selectedBrewery?.id,
        }),
      });

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to match beers');
      }

      const matchData = await matchResponse.json();
      matchedBeers = matchData.data?.matches || [];
    } catch (err) {
      console.error('Error matching beers:', err);
      throw err;
    }
  }

  $effect(() => {
    searchBreweries(breweryQuery);
  });

  // Re-match when brewery filter changes
  $effect(() => {
    if (extractedNames.length > 0) {
      void selectedBrewery;
      matchBeers();
    }
  });

  async function analyzeMenu() {
    if (!imageFile) return;

    analyzing = true;
    error = null;

    try {
      // Step 1: Extract beer names from image
      const formData = new FormData();
      formData.append('image', imageFile);

      const analyzeResponse = await fetch('/api/menu/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze menu image');
      }

      const { data: analyzeData } = await analyzeResponse.json();
      extractedNames = analyzeData.beerNames;

      // Step 2: Match beer names against database
      await matchBeers();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error(err);
    } finally {
      analyzing = false;
    }
  }

  function reset() {
    imageFile = null;
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    imagePreview = null;
    extractedNames = [];
    matchedBeers = [];
    error = null;
    clearBrewery();
  }
</script>

<div class="container">
  <h1 class="margin-bottom-lg">Scan Menu</h1>

  {#if !imagePreview}
    <div class="upload-section">
      <p class="margin-bottom-base">
        Take a photo of a beer menu or upload an image to see which beers you've already had.
      </p>

      <label class="button button-primary" for="menu-upload"> Choose Photo or Take Photo </label>
      <input
        id="menu-upload"
        type="file"
        accept="image/*"
        capture="environment"
        onchange={handleFileChange}
        style="display: none;" />
    </div>
  {:else}
    <div class="preview-section">
      {#if extractedNames.length > 0}
        <div class="brewery-filter margin-bottom-lg">
          <label for="brewery-search" class="fs-sm margin-bottom-xs"> Filter by brewery </label>
          <div class="autocomplete-wrapper">
            <input
              id="brewery-search"
              type="text"
              placeholder="Type brewery name..."
              bind:value={breweryQuery}
              onfocus={() => breweryQuery && (showBreweryResults = true)}
              onblur={() => setTimeout(() => (showBreweryResults = false), 200)}
              class="input" />
            {#if selectedBrewery}
              <button class="clear-brewery" onclick={clearBrewery} aria-label="Clear brewery">
                ✕
              </button>
            {/if}
            {#if showBreweryResults && breweryResults.length > 0}
              <ul class="autocomplete-results">
                {#each breweryResults as result (result.slug)}
                  <li>
                    <button onclick={() => selectBrewery(result)} class="autocomplete-item">
                      {result.brewery_name}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
      {/if}

      <div class="image-preview margin-bottom-base">
        <img src={imagePreview} alt="Menu preview" />
      </div>

      {#if !analyzing && extractedNames.length === 0}
        <button class="button button-primary" onclick={analyzeMenu}>Analyze Menu</button>
        <button class="button button-translucent margin-left-sm" onclick={reset}> Cancel </button>
      {/if}

      {#if analyzing}
        <p class="margin-top-base">Analyzing menu...</p>
      {/if}

      {#if error}
        <div class="error margin-top-base">
          <p><strong>Error:</strong> {error}</p>
          <button class="button margin-top-sm" onclick={reset}>Try Again</button>
        </div>
      {/if}

      {#if extractedNames.length > 0}
        <div class="results margin-top-lg">
          <h2 class="margin-bottom-base">
            Results
            {#if selectedBrewery}
              <span class="fs-sm fw-normal">
                (filtered by {selectedBrewery.name})
              </span>
            {/if}
          </h2>

          {#if matchedBeers.length > 0}
            <section class="margin-bottom-xl">
              <h3 class="margin-bottom-sm">
                Beers You've Had ({matchedBeers.length})
              </h3>
              <ul>
                {#each matchedBeers as beer (beer.id)}
                  <li><BeerPlacard {beer} /></li>
                {/each}
              </ul>
            </section>
          {:else}
            <p class="margin-bottom-base">No matches found in your history.</p>
          {/if}

          <section>
            <h3 class="margin-bottom-sm">
              All Beers Found ({extractedNames.length})
            </h3>
            <ul class="beer-names">
              {#each extractedNames as name, i (i)}
                <li>{name}</li>
              {/each}
            </ul>
          </section>

          <button class="button margin-top-lg" onclick={reset}>Scan Another Menu</button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .brewery-filter {
    label {
      display: block;
      font-weight: 500;
    }
  }

  .autocomplete-wrapper {
    position: relative;
  }

  .input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-base);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-base);
    background: var(--color-bg-secondary, #1a1a1a);
    color: var(--color-text);
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }

  .clear-brewery {
    position: absolute;
    right: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-white-15);
    opacity: 0.6;
    font-size: 14px;

    &:hover {
      opacity: 1;
      background: var(--color-white-25);
    }
  }

  .autocomplete-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--color-bg-secondary, #1a1a1a);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-base);
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
    list-style: none;
    padding: 0;
  }

  .autocomplete-item {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-base);
    text-align: left;
    background: transparent;
    border: none;
    color: var(--color-text);
    cursor: pointer;

    &:hover {
      background: var(--color-white-8);
    }
  }

  .upload-section {
    text-align: center;
    padding: var(--spacing-xl);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-base);
  }

  .image-preview {
    max-width: 100%;
    border-radius: var(--radius-base);
    overflow: hidden;

    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }

  .error {
    padding: var(--spacing-base);
    background: var(--color-error-bg, #fee);
    border: 1px solid var(--color-error, #c33);
    border-radius: var(--radius-base);
    color: var(--color-error, #c33);
  }

  .beer-names {
    list-style: disc;
    padding-left: var(--spacing-lg);

    li {
      margin-bottom: var(--spacing-xs);
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: var(--spacing-xs);
    }
  }
</style>
