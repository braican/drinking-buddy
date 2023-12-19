<script lang="ts">
  import { CheckinList } from '@components';
  export let data;
</script>

<div data-id={data.venue.id}>
  <header class="venue-header padding-bottom-lg">
    <h1 class="venue-name">{data.venue.name}</h1>
    <div class="venue-data">
      <p class="margin-top-sm">
        Rating: <strong>{data.venue ? data.venue.average.toFixed(2) : '-'}</strong>
      </p>
      <p>Hads: <strong>{data.venue.hads}</strong></p>
    </div>

    <p class="margin-top-sm">
      {data.venue.address}<br />{data.venue.city}, {data.venue.state}<br />{data.venue.country}
    </p>
  </header>

  <section class="list-section">
    {#await data.streamed.checkins}
      <p>Loading</p>
    {:then paginatedCheckins}
      {#if paginatedCheckins.checkins.length > 0}
        <CheckinList checkinData={paginatedCheckins} venueId={data.venue.id} />
      {:else}
        <p class="margin-top-lg">No checkins</p>
      {/if}
    {/await}
  </section>
</div>

<style lang="scss">
  .venue-header {
    display: grid;
    gap: var(--spacing-base) var(--spacing-lg);
    grid-template-columns: auto auto;

    .venue-name {
      grid-column: 1 / span 2;
    }
  }
</style>
