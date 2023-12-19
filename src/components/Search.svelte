<script lang="ts">
  import { viewStore } from '@stores';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { CloseIcon } from '@icons';
  import { ApiRequest, debounce } from '@utils';
  import type { SearchResult } from '@types';

  let query = '';
  let inputEl = null;
  let loading = false;
  let breweryResults: SearchResult[] = [];
  let beerResults: SearchResult[] = [];
  let abortController;
  const QUERY_LENGTH_THRESHOLD = 3;

  onMount(() => {
    if (inputEl) {
      inputEl.focus();
    }

    delayedFetch();

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  });

  const delayedFetch = debounce(async () => {
    if (query.length < QUERY_LENGTH_THRESHOLD) return;

    if (abortController) abortController.abort();
    abortController = new AbortController();
    const req = new ApiRequest(fetch);

    try {
      const r = await req.get<{ breweryResults: []; beerResults: [] }>(`search?query=${query}`, {
        signal: abortController.signal,
      });

      beerResults = r.beerResults;
      breweryResults = r.breweryResults;
    } catch (error) {
      console.error('There was an error fetching search results.', error);
    }

    loading = false;
  }, 200);

  const onInput = () => {
    if (query.length < QUERY_LENGTH_THRESHOLD) {
      beerResults = [];
      breweryResults = [];
      loading = false;
      return;
    }

    loading = true;

    delayedFetch();
  };
</script>

<div class="modal padding-base" transition:fade={{ duration: 100 }}>
  <button class="close-button padding-bottom-lg" on:click={viewStore.hideSearch}>
    <span class="fs-xs">Close search</span>
    <CloseIcon />
  </button>

  <input
    class="search-input"
    type="text"
    bind:this={inputEl}
    bind:value={query}
    on:input={onInput}
    placeholder="Search for a brewery or beer..." />

  <div>
    {#if loading}
      <p class="loading margin-top-lg color-opacity-50">Loading...</p>
    {:else if beerResults.length === 0 && breweryResults.length === 0 && query.length > QUERY_LENGTH_THRESHOLD - 1}
      <p class="margin-top-lg fs-lg">No breweries or beers match your search.</p>
    {:else}
      {#if breweryResults.length > 0}
        <div class="margin-top-lg">
          <p class="padding-top-bottom-base fs-sm tt-uppercase"><strong>Breweries</strong></p>

          <ul>
            {#each breweryResults as breweryResult}
              <li class="top-border">
                <a class="result-link padding-base fs-lg" href={`/brewery/${breweryResult.slug}`}>
                  {breweryResult.brewery_name}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if beerResults.length > 0}
        <div class="margin-top-lg">
          <p class="padding-top-bottom-base fs-sm tt-uppercase"><strong>Beers</strong></p>
          <ul>
            {#each beerResults as beerResult}
              <li class="top-border">
                <a class="result-link padding-base fs-lg" href={`/beer/${beerResult.slug}`}>
                  <span class="fs-sm color-opacity-50">{beerResult.brewery_name}</span><br />
                  {beerResult.beer_name}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style lang="scss">
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-black);
    z-index: 10;
    overflow: auto;
  }

  .close-button {
    display: flex;
    margin-left: auto;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--color-white);

    &:hover {
      color: var(--color-primary);
    }

    span {
      white-space: nowrap;
    }

    :global(svg) {
      width: 24px;
    }
  }

  .search-input {
    width: 100%;
    font-size: var(--step-2);
    padding: 0.5em;
    background-color: var(--color-white-alpha-06);
  }
  .search-input::placeholder {
    opacity: 0.3;
  }

  .result-link {
    display: block;

    &:hover {
      color: var(--color-primary);
    }
  }
</style>
