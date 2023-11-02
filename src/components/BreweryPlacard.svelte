<script lang="ts">
  import type { BreweryRecord } from '@app';
  import { DownArrowIcon } from '@icons';
  import { BeerPlacard } from '@components';

  export let brewery: BreweryRecord;
  export let filtered = false;

  let expandedBeers = false;
</script>

<article data-brewery-id={brewery.id} class="brewery padding-base">
  <span class="brewery-name fs-lg">
    <a href={`/brewery/${brewery.slug}`} class="link">{brewery.name}</a>
  </span>
  <div class="brewery-average">
    <span class="fs-lg ff-mono">{brewery.average.toFixed(2)}</span>
    {#if filtered}
      <p class="fs-xs">average rating</p>
    {/if}
  </div>

  <p class="brewery-count fs-sm color-opacity-50">
    {#if filtered}
      <button class="expand-beers" on:click={() => (expandedBeers = !expandedBeers)}>
        <span class="expand-beers-icon" class:flipped={expandedBeers}><DownArrowIcon /></span>
        {brewery.beers.length?.toLocaleString()} Beer{brewery.beers.length > 1 ? 's' : ''}, {brewery.beerCount?.toLocaleString()}
        Checkin{brewery.beerCount > 1 ? 's' : ''}
      </button>
    {:else}
      Total beers: {brewery.checkinCount?.toLocaleString()}
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

    svg {
      display: block;
    }

    &.flipped {
      transform: rotate(180deg);
    }
  }
</style>
