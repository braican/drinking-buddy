<script lang="ts">
  import { fade } from 'svelte/transition';
  import { CloseIcon } from '@icons';
  import { LoadingMessage, MenuBeerPlacard } from '@components';
  import type { Brewery, SearchResult, MenuItem, MenuMatch, MenuScanUsage } from '@types';
  import { debounce, formatUsd } from '@utils';

  // The long edge Claude's vision tier renders at — resizing past this costs
  // upload time and image tokens without adding detail.
  const MAX_EDGE = 2576;

  let imageFile: File | null = $state(null);
  let imagePreview: string | null = $state(null);
  let analyzing = $state(false);
  let error: string | null = $state(null);
  let showPhotoModal = $state(false);

  let items: MenuItem[] = $state([]);
  let menuBrewery: string | null = $state(null);
  let scanned = $state(false);

  let matches: MenuMatch[] = $state([]);
  let matching = $state(false);

  const had = $derived(matches.filter(match => match.beer));
  const notHad = $derived(matches.filter(match => !match.beer));

  // Declared once (the script body runs on instantiation, not per update) so the
  // array identity stays stable and the cycling effect never restarts mid-scan.
  const SCANNING_MESSAGES = [
    'Reading the menu...',
    'Squinting at the handwriting...',
    'Sorting drafts from cans...',
    'Ignoring the food menu...',
    'Double-checking the taps...',
  ];

  let usage: MenuScanUsage | null = $state(null);
  // Running totals for the page's lifetime, so repeat scans show what they add up to.
  let sessionCost = $state(0);
  let scanCount = $state(0);

  // Brewery scoping
  let breweryQuery = $state('');
  let selectedBrewery: Brewery | null = $state(null);
  let breweryResults: SearchResult[] = $state([]);
  let showBreweryResults = $state(false);
  /** Keyboard-highlighted result, -1 when none. */
  let activeIndex = $state(-1);
  let comboboxEl: HTMLElement | null = $state(null);

  /**
   * Re-encodes the photo to a JPEG no larger than MAX_EDGE on its long edge.
   * Phone cameras hand us 4000px HEIC or multi-megabyte JPEGs; the API takes
   * neither HEIC nor anything over 5MB. Falls back to the original file if the
   * browser can't decode it.
   */
  async function normalizeImage(file: File): Promise<File> {
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
      bitmap.close();

      const blob: Blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

      if (!blob) return file;

      return new File([blob], 'menu.jpg', { type: 'image/jpeg' });
    } catch (err) {
      console.error('Could not normalize image, sending the original.', err);
      return file;
    }
  }

  async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    resetResults();
    imageFile = await normalizeImage(file);
    imagePreview = URL.createObjectURL(imageFile);
  }

  const searchBreweries = debounce(async (query: string) => {
    if (query.trim().length < 2) {
      breweryResults = [];
      closeBreweryResults();
      return;
    }

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) return;

      const { data } = await response.json();

      // Drop a response that arrived after the query moved on or a brewery was
      // picked — otherwise a request already in flight reopens the list.
      if (query !== breweryQuery || selectedBrewery) return;

      breweryResults = data.breweryResults || [];
      showBreweryResults = breweryResults.length > 0;
      activeIndex = -1;
    } catch (err) {
      console.error('Error searching breweries:', err);
    }
  }, 300);

  // Searching is driven from the input event, not from a $effect on breweryQuery.
  // An effect can't tell the user typing from us writing the chosen brewery back
  // into the field, so selecting one would kick off a fresh search and reopen the
  // list with the brewery that was just picked.
  function onBreweryInput(event: Event) {
    // Typing invalidates whatever was selected before.
    selectedBrewery = null;
    activeIndex = -1;
    searchBreweries((event.currentTarget as HTMLInputElement).value);
  }

  function closeBreweryResults() {
    showBreweryResults = false;
    activeIndex = -1;
  }

  function onBreweryKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeBreweryResults();
      return;
    }

    if (!showBreweryResults || !breweryResults.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % breweryResults.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = activeIndex <= 0 ? breweryResults.length - 1 : activeIndex - 1;
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectBrewery(breweryResults[activeIndex]);
    }
  }

  async function selectBrewery(result: SearchResult) {
    try {
      const response = await fetch(`/api/brewery?slug=${result.slug}`);
      if (!response.ok) return;

      const { data } = await response.json();
      selectedBrewery = data.brewery;
      breweryQuery = selectedBrewery.name;
      breweryResults = [];
      closeBreweryResults();
    } catch (err) {
      console.error('Error fetching brewery:', err);
    }
  }

  function clearBrewery() {
    selectedBrewery = null;
    breweryQuery = '';
    breweryResults = [];
    closeBreweryResults();
  }

  async function analyzeMenu() {
    if (!imageFile) return;

    analyzing = true;
    error = null;

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (selectedBrewery) {
        formData.append('breweryName', selectedBrewery.name);
      }

      const response = await fetch('/api/menu/analyze', {
        method: 'POST',
        body: formData,
      });

      const { success, data, message } = await response.json();

      if (!success) {
        throw new Error(message || 'Failed to analyze the menu image.');
      }

      items = data.items || [];
      menuBrewery = data.menuBrewery;
      usage = data.usage;
      scanned = true;

      sessionCost += usage?.usd ?? 0;
      scanCount += 1;

      console.log('Menu scan:', data);

      await matchItems();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error(err);
    } finally {
      analyzing = false;
    }
  }

  /** Resolves the scanned names against the beer history. No AI, no extra cost. */
  async function matchItems() {
    if (!items.length) return;

    matching = true;

    try {
      const response = await fetch('/api/menu/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, menuBrewery }),
      });

      const { success, data, message } = await response.json();

      if (!success) {
        throw new Error(message || 'Failed to match beers.');
      }

      matches = data.matches;
      console.log('Menu matches:', data);
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error(err);
    } finally {
      matching = false;
    }
  }

  // Deliberately leaves sessionCost and scanCount alone — they track the page,
  // not the current photo.
  function resetResults() {
    items = [];
    matches = [];
    menuBrewery = null;
    usage = null;
    scanned = false;
    error = null;
    showPhotoModal = false;
  }

  function reset() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    imageFile = null;
    imagePreview = null;
    resetResults();
  }
</script>

<div>
  <header class="padding-bottom-lg">
    <h1>Scan Menu</h1>
  </header>

  <div class="brewery-filter margin-bottom-lg">
    <label for="brewery-search" class="fs-sm margin-bottom-xs">
      Brewery <span class="color-opacity-50">(optional)</span>
    </label>
    <div class="autocomplete-wrapper" bind:this={comboboxEl}>
      <input
        id="brewery-search"
        type="text"
        placeholder="Type brewery name..."
        role="combobox"
        aria-expanded={showBreweryResults}
        aria-controls="brewery-results"
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `brewery-option-${activeIndex}` : undefined}
        bind:value={breweryQuery}
        oninput={onBreweryInput}
        onkeydown={onBreweryKeydown}
        onfocus={() => breweryResults.length > 0 && (showBreweryResults = true)}
        class="input" />
      {#if selectedBrewery}
        <button class="clear-brewery" onclick={clearBrewery} aria-label="Clear brewery"> ✕ </button>
      {/if}
      {#if showBreweryResults && breweryResults.length > 0}
        <ul class="autocomplete-results" id="brewery-results" role="listbox">
          {#each breweryResults as result, i (result.slug)}
            <li role="presentation">
              <button
                id={`brewery-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onclick={() => selectBrewery(result)}
                class="autocomplete-item"
                class:active={i === activeIndex}>
                {result.brewery_name}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  {#if !imagePreview}
    <div class="upload-section">
      <p class="margin-bottom-md">Take a photo of a beer menu or upload an image.</p>

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
      {#if !scanned}
        <div class="image-preview margin-bottom-md">
          <img src={imagePreview} alt="Menu preview" />
        </div>

        {#if !analyzing}
          <button class="button button-orange" onclick={analyzeMenu}>Scan Menu</button>
          <button class="button button-translucent margin-left-sm" onclick={reset}>Cancel</button>
        {:else}
          <div class="margin-top-base">
            <LoadingMessage messages={SCANNING_MESSAGES} label="Reading the menu" />
          </div>
        {/if}
      {/if}

      {#if error}
        <div class="error margin-top-base">
          <p><strong>Error:</strong> {error}</p>
          <button class="button margin-top-sm" onclick={reset}>Try Again</button>
        </div>
      {/if}

      {#if scanned}
        <div class="results">
          <div class="results-header margin-bottom-md">
            <h2>
              {items.length} on the menu
              {#if menuBrewery}
                <span class="fs-sm fw-normal color-opacity-50">— {menuBrewery}</span>
              {/if}
            </h2>
            <button class="button button-translucent fs-sm" onclick={() => (showPhotoModal = true)}>
              View Photo
            </button>
          </div>

          <p class="cost margin-bottom-md fs-sm color-opacity-50">
            {#if !matching}
              {notHad.length} new to you, {had.length} you've had<br />
            {/if}
            {formatUsd(usage?.usd ?? null)} this scan
            {#if scanCount > 1}
              · {formatUsd(sessionCost)} across {scanCount} scans
            {/if}
          </p>

          {#if items.length === 0}
            <p>No drinks found in this photo.</p>
          {:else if matching}
            <!-- One message: this step is fast, so it just throbs rather than cycling. -->
            <LoadingMessage messages={['Checking your history...']} />
          {:else}
            <!-- One list, in the order the menu listed them. -->
            {#each matches as match, i (`${match.item.name}-${i}`)}
              <MenuBeerPlacard name={match.item.name} beer={match.beer}>
                {#snippet badges()}
                  {#if match.item.status !== 'available'}
                    <span class="badge fs-sm">{match.item.status.replace('_', ' ')}</span>
                  {/if}
                  {#if match.item.confidence === 'low'}
                    <span class="badge badge-warn fs-sm">unsure</span>
                  {/if}
                {/snippet}

                {#snippet details()}
                  {#if match.item.brewery}
                    <p class="fs-sm color-opacity-50 margin-top-xs">{match.item.brewery}</p>
                  {/if}
                  {#if match.beer && match.beer.name !== match.item.name}
                    <!-- The canonical name differs from what the menu printed, so say
                         what it resolved to rather than leaving the match unexplained. -->
                    <p class="fs-sm color-opacity-50 margin-top-xs">
                      matched to "{match.beer.name}"
                    </p>
                  {/if}
                {/snippet}
              </MenuBeerPlacard>
            {/each}
          {/if}

          <div class="margin-top-lg">
            <button class="button button-orange" onclick={analyzeMenu}>Re-scan</button>
            <button class="button button-translucent margin-left-sm" onclick={reset}>
              Scan Another Menu
            </button>
          </div>
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

<!-- Dismissal has to be document-level: the input's own blur event never fires
     when focus was already elsewhere, so clicking the page left the list open. -->
<svelte:document
  onpointerdown={e => {
    if (showBreweryResults && comboboxEl && !comboboxEl.contains(e.target as Node)) {
      closeBreweryResults();
    }
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

  .badge {
    padding: 0.1em 0.5em;
    border-radius: var(--border-radius);
    background: var(--color-white-15);
    text-transform: capitalize;
  }

  .badge-warn {
    background: var(--color-primary);
    color: var(--color-black);
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
    background: var(--color-black);
    border: 1px solid var(--field-border);
    border-radius: var(--border-radius);
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
    color: var(--color-white);
    cursor: pointer;

    &:hover,
    &.active {
      background: var(--color-white-8);
    }
  }

  .image-preview {
    max-width: 100%;
    border-radius: var(--border-radius);
    overflow: hidden;

    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }

  .error {
    padding: var(--spacing-base);
    background: color-mix(in srgb, var(--color-accent) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-accent) 50%, transparent);
    border-radius: var(--border-radius);
  }
</style>
