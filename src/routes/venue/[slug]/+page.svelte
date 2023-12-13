<script lang="ts">
  import { CheckinList } from '@components';
  export let data;
</script>

<div data-id={data.venue.id}>
  <header class="padding-bottom-lg">
    <div class="beer-header">
      <div>
        <h1>{data.venue.name}</h1>
        <p class="margin-top-sm">Rating: <strong>{data.venue.average.toFixed(2)}</strong></p>
        <p>Hads: <strong>{data.venue.hads}</strong></p>
      </div>
    </div>
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
