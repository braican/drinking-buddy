<script lang="ts">
  import type { Brewery } from '@models';

  export let brewery: Brewery;
</script>

<article data-brewery-id={brewery.id} class="brewery padding-base">
  <span class="brewery-name fs-lg">
    <a href={`/brewery/${brewery.slug}`} class="link">{brewery.name}</a>
  </span>
  <span class="brewery-average fs-lg ff-mono">{brewery.average.toFixed(2)}</span>
  <span class="brewery-count fs-sm color-opacity-50">Total beers: {brewery.checkinCount}</span>
</article>

<style lang="scss">
  .brewery {
    display: grid;
    grid-template:
      'name average'
      'count average' /
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
</style>
