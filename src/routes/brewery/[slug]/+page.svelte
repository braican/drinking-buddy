<script lang="ts">
  import { Tabs, BeerList, CheckinList } from '@components';

  export let data;
</script>

<div data-id={data.brewery.id}>
  <header class="padding-bottom-lg">
    <h1>{data.brewery.name}</h1>

    <p class="color-opacity-50 margin-top-sm">
      {data.brewery.city}, {data.brewery.state}, {data.brewery.country}
    </p>

    <p class="margin-top-md">
      Rating: <strong>{data.brewery ? data.brewery.average?.toFixed(2) : '-'}</strong>
    </p>
    <p>
      {data.beers.length} beer{data.beers.length > 1 ? 's' : ''} /
      {data.brewery.hads} checkin{data.brewery.hads > 1 ? 's' : ''}
    </p>
  </header>

  <Tabs views={['Beers', 'Checkins']} let:view>
    {#if view === 'Beers'}
      <BeerList beers={data.beers} showBreweries={false} />
    {:else if view === 'Checkins'}
      <section class="list-section">
        {#await data.streamed.checkins}
          <p>Loading</p>
        {:then paginatedCheckins}
          {#if paginatedCheckins.checkins.length > 0}
            <CheckinList checkinData={paginatedCheckins} breweryId={data.brewery.id} />
          {:else}
            <p class="margin-top-lg">No checkins</p>
          {/if}
        {/await}
      </section>
    {/if}
  </Tabs>
</div>
