<script lang="ts">
  import { CheckinPlacard } from '@components';
  export let data;
</script>

<header class="padding-bottom-lg">
  <div class="beer-header">
    <p class="brewery-name">
      <a class="link" href={`/brewery/${data.beer.brewery.slug}`}
        >&larr; {data.beer.brewery.name}</a>
    </p>

    <div>
      <h1>{data.beer.name}</h1>
      <p class="fs-sm color-opacity-50 margin-top-sm">{data.beer.abv}% ABV</p>
      <p class="fs-sm color-opacity-50">{data.beer.style}</p>
      <p class="margin-top-sm">Rating: <strong>{data.beer.average.toFixed(2)}</strong></p>
      <p>Hads: <strong>{data.beer.hads}</strong></p>
    </div>

    {#if data.beer.label}
      <img
        src={data.beer.label.replace('untappd.akamaized.net', 'assets.untappd.com')}
        alt={data.beer.name} />
    {/if}
  </div>
</header>

<section class="list-section">
  <h2 class="list-header">Checkins</h2>

  {#if data.checkins.length > 0}
    <ul class="margin-top-lg">
      {#each data.checkins as checkin}
        <li><CheckinPlacard {checkin} light /></li>
      {/each}
    </ul>
  {:else}
    <p class="margin-top-lg">No checkins</p>
  {/if}
</section>

<style lang="scss">
  .beer-header {
    display: grid;
    gap: var(--spacing-base);
    grid-template-columns: auto 60px;
    grid-template-rows: auto auto;

    .brewery-name {
      grid-column: 1 / span 2;
    }
  }
</style>
