<script lang="ts">
  import { Tabs, BeerList, CheckinPlacard } from '@components';

  export let data;
</script>

<header class="padding-bottom-lg">
  <h1>{data.brewery.name}</h1>

  <p class="color-opacity-50 margin-top-sm">{data.brewery.city}, {data.brewery.state}</p>

  {#await data.streamed.stats}
    <p class="margin-top-md">Loading...</p>
  {:then stats}
    <p class="margin-top-md">Rating: <strong>{stats.rating}</strong></p>
    <p>{stats.checkinCount} checkin{stats.checkinCount > 1 ? 's' : ''}</p>
    <p>{stats.beers.length} beer{stats.beers.length > 1 ? 's' : ''}</p>
  {/await}
</header>

{#await data.streamed.stats then stats}
  <Tabs views={['Beers', 'Checkins']} let:view>
    {#if view === 'Beers'}
      {#await data.streamed.stats then stats}
        <BeerList beers={stats.beers} showBreweries={false} />
      {/await}
    {:else if view === 'Checkins'}
      <section class="list-section">
        {#if stats.checkins}
          <h2 class="list-header">{stats.checkins.length} Checkins</h2>
          <ul class="margin-top-lg">
            {#each stats.checkins as checkin}
              <li><CheckinPlacard {checkin} /></li>
            {/each}
          </ul>
        {:else}
          <p class="margin-top-lg">No checkins</p>
        {/if}
      </section>
    {/if}
  </Tabs>
{/await}
