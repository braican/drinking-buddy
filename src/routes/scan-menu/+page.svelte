<script lang="ts">
  import { fade } from 'svelte/transition';
  import { BeerPlacard } from '@components';
  import { CloseIcon } from '@icons';
  import type { BeerWithData, SearchResult, Brewery } from '@types';
  import { debounce } from '@utils';

  let imageFile: File | null = $state(null);
  let imagePreview: string | null = $state(null);
  let analyzing = $state(false);
  let extractedNames: string[] = $state([]);
  let matchedBeers: BeerWithData[] = $state([]);
  let error: string | null = $state(null);
  let showPhotoModal = $state(false);

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
    showPhotoModal = false;
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
      console.log('Extracted beer names from menu scan:', extractedNames);

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
    showPhotoModal = false;
    clearBrewery();
  }
</script>

<div>
  <header class="padding-bottom-lg">
    <h1>Scan Menu</h1>
  </header>

  {#if !imagePreview}
    <div class="upload-section">
      <p class="margin-bottom-md">
        Take a photo of a beer menu or upload an image to see which beers you've already had.
      </p>

      <label class="button button-translucent" for="menu-upload">
        Choose Photo or Take Photo
      </label>
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
      {#if extractedNames.length === 0}
        <div class="image-preview margin-bottom-md">
          <img src={imagePreview} alt="Menu preview" />
        </div>

        <div class="brewery-filter margin-bottom-lg">
          <label for="brewery-search" class="fs-sm margin-bottom-xs">
            Filter by brewery <span class="color-opacity-50">(optional)</span>
          </label>
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

      {#if !analyzing && extractedNames.length === 0}
        <button class="button button-orange" onclick={analyzeMenu}>Scan Menu</button>
        <button class="button button-translucent margin-left-sm" onclick={reset}> Cancel </button>
      {/if}

      {#if analyzing}
        <p class="margin-top-base">Scanning menu...</p>
      {/if}

      {#if error}
        <div class="error margin-top-base">
          <p><strong>Error:</strong> {error}</p>
          <button class="button margin-top-sm" onclick={reset}>Try Again</button>
        </div>
      {/if}

      {#if extractedNames.length > 0}
        <div class="results margin-top-lg">
          <div class="results-header margin-bottom-md">
            <h2>
              Results
              {#if selectedBrewery}
                <span class="fs-sm fw-normal">(filtered by {selectedBrewery.name})</span>
              {/if}
            </h2>
            <button class="button button-translucent fs-sm" onclick={() => (showPhotoModal = true)}>
              View Photo
            </button>
          </div>

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
            <p class="margin-bottom-md">No matches found in your history.</p>
          {/if}

          <button class="button button-translucent margin-top-lg" onclick={reset}
            >Scan Another Menu</button>
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if showPhotoModal && imagePreview}
  <div class="photo-modal" transition:fade={{ duration: 150 }}>
    <button
      class="photo-modal-close"
      onclick={() => (showPhotoModal = false)}
      aria-label="Close photo">
      <CloseIcon />
    </button>
    <img src={imagePreview} alt="Scanned menu" class="photo-modal-image" />
  </div>
{/if}

<svelte:window
  onkeydown={e => {
    if (e.key === 'Escape' && showPhotoModal) showPhotoModal = false;
  }} />

<style lang="scss">
  .brewery-filter {
    label {
      display: block;
      font-weight: 500;
    }
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-base);
    flex-wrap: wrap;
  }

  .photo-modal {
    position: fixed;
    inset: 0;
    z-index: 250;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
    background: rgba(0, 0, 0, 0.9);
  }

  .photo-modal-image {
    max-width: 100%;
    max-height: 100%;
    display: block;
    border-radius: var(--border-radius);
  }

  .photo-modal-close {
    position: absolute;
    top: var(--spacing-base);
    right: var(--spacing-base);
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-white);
    opacity: 0.7;

    :global(svg) {
      width: 20px;
      display: block;
    }

    &:hover {
      opacity: 1;
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

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: var(--spacing-xs);
    }
  }
</style>
