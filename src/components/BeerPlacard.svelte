<script lang="ts">
  import { formatDate } from '@utils';
  import type { BeerWithData, Beer } from '@types';

  export let showBrewery = true;
  export let beer: BeerWithData | Beer;
  export let sublist = false;
</script>

<article data-beer-id={beer.id} class="beer padding-base" class:top-border={!sublist}>
  <div class="beer-stats">
    <p class="beer-name">
      <a class="link" href={`/beer/${beer.slug}`}>
        {#if showBrewery && typeof beer.brewery === 'object'}
          <span class="brewery-name">{beer.brewery.name}</span>
        {/if}
        <span class="beer-name"><strong>{beer.name}</strong></span>
      </a>
    </p>
    <p class="margin-top-xs fs-sm beer-style">{beer.style}</p>
    <p class="fs-sm beer-abv">{beer.abv}% ABV</p>
    <p class="fs-sm beer-last-had">Last had: {formatDate(beer.last_had)}</p>
  </div>

  <div class="text-align-right">
    <p class="beer-rating fs-lg ff-mono">{beer.average ? beer.average.toFixed(2) : '-'}</p>
    <p class="margin-top-xs beer-count fs-sm">
      {beer.hads} had{beer.hads > 1 ? 's' : ''}
    </p>
  </div>
</article>

<style lang="scss">
  .beer {
    display: flex;
    gap: var(--spacing-lg);
    justify-content: space-between;
  }

  .beer-count {
    white-space: nowrap;
  }
</style>
