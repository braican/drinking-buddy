<script lang="ts">
  import { viewStore } from '@stores';
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { CloseIcon, RightArrowIcon } from '@icons';
  import { ApiRequest } from '@utils';

  let query = '';
  let input = null;
  let loading = false;
  let breweryResults = [];
  let beerResults = [];

  let timer;
  let controller;

  onMount(() => {
    if (input) {
      input.focus();
    }
  });

  onDestroy(() => {
    if (controller) {
      controller.abort();
    }
  });

  $: {
    clearTimeout(timer);
    if (controller) {
      controller.abort();
    }

    if (query.length < 2) {
      loading = false;
      breweryResults = [];
      beerResults = [];
    } else {
      loading = true;
      controller = new AbortController();
      const signal = controller.signal;
      const req = new ApiRequest(fetch);

      timer = setTimeout(() => {
        req
          .get<{ breweryResults: []; beerResults: [] }>(`search?query=${query}`, { signal })
          .then(r => {
            beerResults = r.beerResults;
            breweryResults = r.breweryResults;
            loading = false;
          })
          .catch(error => {
            if (error.name !== 'AbortError') {
              console.error(error);
              loading = false;
            }
          });
      }, 200);
    }
  }
</script>

<div class="modal padding-base" transition:fade={{ duration: 100 }}>
  <button class="close-button padding-bottom-lg" on:click={viewStore.hideSearch}>
    <span class="fs-xs">Close search</span>
    <CloseIcon />
  </button>

  <input
    class="search-input"
    type="text"
    bind:this={input}
    bind:value={query}
    placeholder="Search for a brewery or beer..." />

  <div>
    {#if loading}
      <p class="loading margin-top-lg color-opacity-50">Loading...</p>
    {:else if beerResults.length === 0 && breweryResults.length === 0 && query.length > 2}
      <p class="margin-top-lg fs-lg">No breweries or beers match your search.</p>
    {:else}
      {#if breweryResults.length > 0}
        <div class="margin-top-lg">
          <p class="padding-top-bottom-base fs-sm tt-uppercase"><strong>Breweries</strong></p>

          <ul>
            {#each breweryResults as brewery}
              <li class="top-border">
                <a
                  class="result-link padding-base fs-lg"
                  href={`/brewery/${brewery.slug}`}
                  on:click={viewStore.hideSearch}>
                  {brewery.name}
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
            {#each beerResults as beer}
              <li class="top-border">
                <a
                  class="result-link padding-base fs-lg"
                  href={`/beer/${beer.slug}`}
                  on:click={viewStore.hideSearch}
                  >{beer.name}
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
