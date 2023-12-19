<script lang="ts">
  import { CheckinList } from '@components';
  export let data;
</script>

<div data-id={data.beer.id}>
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
        <p class="margin-top-sm">
          Rating: <strong>{data.beer ? data.beer.average.toFixed(2) : '-'}</strong>
        </p>
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
    {#await data.streamed.checkins}
      <p>Loading</p>
    {:then paginatedCheckins}
      {#if paginatedCheckins.checkins.length > 0}
        <CheckinList checkinData={paginatedCheckins} beerId={data.beer.id} />
      {:else}
        <p class="margin-top-lg">No checkins</p>
      {/if}
    {/await}
  </section>
</div>

<style lang="scss">
  .beer-header {
    display: grid;
    gap: var(--spacing-base) var(--spacing-lg);
    grid-template-columns: auto 60px;
    grid-template-rows: auto auto;

    .brewery-name {
      grid-column: 1 / span 2;
    }
  }
</style>
