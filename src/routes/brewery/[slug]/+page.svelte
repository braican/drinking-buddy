<script lang="ts">
  import { Tabs, BeerPlacard, CheckinPlacard } from '@components';

  export let data;
</script>

<header class="padding-bottom-lg">
  <h1>{data.brewery.name}</h1>

  {#await data.streamed.stats}
    <p>Loading...</p>
  {:then stats}
    <p class="margin-top-sm">Rating: <strong>{stats.rating}</strong></p>
    <p class="margin-top-sm">{stats.checkinCount} checkin{stats.checkinCount > 1 ? 's' : ''}</p>
    <p>{Object.keys(stats.beers).length} beer{Object.keys(stats.beers).length > 1 ? 's' : ''}</p>
  {/await}
</header>

{#await data.streamed.stats then stats}
  <Tabs views={['Beers', 'Checkins']} let:view>
    {#if view === 'Beers'}
      <section class="list-section">
        <h2 class="list-header">Beers</h2>
        {#if stats.beers}
          <ul class="margin-top-lg">
            {#each Object.values(stats.beers) as beer}
              <li><BeerPlacard {beer} /></li>
            {/each}
          </ul>
        {:else}
          <p>No beers.</p>
        {/if}
      </section>
    {:else if view === 'Checkins'}
      <section class="list-section">
        <h2 class="list-header">Checkins</h2>
        {#if stats.checkins}
          <ul class="margin-top-lg">
            {#each stats.checkins as checkin}
              <li><CheckinPlacard {checkin} /></li>
            {/each}
          </ul>
        {:else}
          <p>No checkins.</p>
        {/if}
      </section>
    {/if}
  </Tabs>
{/await}
