<script lang="ts">
  import { Tabs, BeerList, CheckinPlacard } from '@components';

  export let data;
</script>

<header class="padding-bottom-lg">
  <h1>{data.brewery.name}</h1>

  <p class="color-opacity-50 margin-top-sm">
    {data.brewery.city}, {data.brewery.state}, {data.brewery.country}
  </p>

  <p class="margin-top-md">Rating: <strong>{data.brewery.average.toFixed(2)}</strong></p>
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
      {#if data.checkins}
        <h2 class="list-header">{data.checkins.length} Checkins</h2>
        <ul class="margin-top-lg">
          {#each data.checkins as checkin}
            <li><CheckinPlacard {checkin} /></li>
          {/each}
        </ul>
      {:else}
        <p class="margin-top-lg">No checkins</p>
      {/if}
    </section>
  {/if}
</Tabs>
