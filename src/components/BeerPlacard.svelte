<script lang="ts">
  import { formatDate } from '@utils';
  import type { BreweryBeer } from '@app';

  export let beer: BreweryBeer;

  const rating = (
    beer.checkins.reduce((c, { rating }) => rating + c, 0) / beer.checkins.length
  ).toFixed(2);
</script>

<article data-beer-id={beer.id} class="beer padding-base top-border">
  <div class="beer-stats">
    <p class="beer-name"><strong>{beer.name}</strong></p>
    <p class="margin-top-xs fs-sm beer-style">{beer.style}</p>
    <p class="fs-sm beer-abv">{beer.abv}% ABV</p>
    <p class="fs-sm beer-last-had">Last had: {formatDate(beer.lastHad.toString())}</p>
  </div>

  <div class="text-align-right">
    <p class="beer-rating fs-lg ff-mono">{rating}</p>
    <p class="margin-top-xs beer-count fs-sm">
      {beer.checkins.length} had{beer.checkins.length > 1 ? 's' : ''}
    </p>
  </div>
</article>

<style lang="scss">
  .beer {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: space-between;
  }
</style>
