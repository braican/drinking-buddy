<script lang="ts">
  import type { Brewery } from '@types';
  import { DownArrowIcon } from '@icons';
  import { BeerPlacard } from '@components';

  export let brewery: Brewery;
  export let filtered = false;

  let expandedBeers = false;
</script>

<article data-brewery-id={brewery.id} class="brewery padding-base">
  <span class="brewery-name fs-lg">
    <a href={`/brewery/${brewery.slug}`} class="link">{brewery.name}</a>
  </span>
  <div class="brewery-average">
    <span class="fs-lg ff-mono">{brewery.average ? brewery.average.toFixed(2) : '-'}</span>
    {#if filtered}
      <p class="fs-xs">average rating</p>
    {/if}
  </div>

  <p class="brewery-count fs-sm color-opacity-50">
    {#if filtered}
      <button class="expand-beers" on:click={() => (expandedBeers = !expandedBeers)}>
        <span class="expand-beers-icon" class:flipped={expandedBeers}><DownArrowIcon /></span>
        {brewery.beers.length?.toLocaleString()} beer{brewery.beers.length > 1 ? 's' : ''},
        {brewery.hads?.toLocaleString()} checkin{brewery.hads > 1 ? 's' : ''}
      </button>
    {:else}
      Total beers: {brewery.hads?.toLocaleString()}
    {/if}
  </p>

  {#if expandedBeers}
    <ul class="beer-list">
      {#each brewery.beers as beer}
        <li>
          <BeerPlacard {beer} showBrewery={false} sublist={true} />
        </li>
      {/each}
    </ul>
  {/if}
</article>

<style lang="scss">
  .brewery {
    display: grid;
    grid-template:
      'name average'
      'count average'
      'beerList beerList' /
      auto 80px;
    gap: var(--spacing-sm);
    border-top: 1px solid var(--color-white-15);
  }

  .brewery-name {
    grid-area: name;
  }
  .brewery-average {
    grid-area: average;
    text-align: right;
  }
  .brewery-count {
    grid-area: count;
  }

  .expand-beers {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .beer-list {
    grid-area: beerList;
  }

  .expand-beers-icon {
    width: 18px;
    display: flex;

    :global(svg) {
      display: block;
    }

    &.flipped {
      transform: rotate(180deg);
    }
  }
</style>
