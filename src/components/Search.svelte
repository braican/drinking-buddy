<script lang="ts">
  import { viewStore } from '@stores';
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { CloseIcon, RightArrowIcon } from '@icons';
  import { ApiRequest } from '@utils';
  import type { Brewery } from '@models';
  import type { BrewerySearchResults } from '@app';

  let query = '';
  let input = null;
  let loading = false;
  let results: Brewery[] = [];

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
      results = [];
    } else {
      loading = true;
      controller = new AbortController();
      const signal = controller.signal;
      const req = new ApiRequest(fetch);

      timer = setTimeout(() => {
        req
          .get<BrewerySearchResults>(`breweries/search?query=${query}`, { signal })
          .then(r => {
            results = r.results;
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
    placeholder="Search for a brewery..." />

  <div>
    {#if loading}
      <p class="loading margin-top-lg color-opacity-50">Loading...</p>
    {:else if results.length === 0 && query.length > 2}
      <p class="margin-top-lg">No breweries match your search.</p>
    {:else}
      <ul class="margin-top-lg">
        {#each results as result}
          <li class="top-border">
            <a
              class="brewery-link padding-base fs-lg"
              href={`/brewery/${result.slug}`}
              on:click={viewStore.hideSearch}>
              {#each result.name.split(' ') as word, i}
                <span>
                  {word}
                  {#if i === result.name.split(' ').length - 1}
                    <RightArrowIcon />
                  {/if}
                </span>
              {/each}
            </a>
          </li>
        {/each}
      </ul>
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

  .brewery-link {
    display: block;

    &:hover {
      color: var(--color-primary);
    }

    > span:last-child {
      white-space: nowrap;
    }

    :global(svg) {
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      opacity: 0.2;
    }
  }
</style>
