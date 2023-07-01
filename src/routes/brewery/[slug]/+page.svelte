<script lang="ts">
  import { BeerPlacard, CheckinPlacard } from '@components';
  import type { BreweryStats } from '@app';

  export let data: BreweryStats;
</script>

<header class="padding-bottom-lg">
  <h1>{data.name}</h1>
  <p>Rating: {data.rating}</p>
  <p>Total checkins: {data.checkinCount}</p>
  <p>Total beers: {Object.keys(data.beers).length}</p>
</header>

<section class="list-section">
  <h2 class="list-header">All beers</h2>
  {#if data.beers}
    <ul class="margin-top-lg">
      {#each Object.values(data.beers) as beer}
        <li><BeerPlacard {beer} /></li>
      {/each}
    </ul>
  {:else}
    <p>No beers.</p>
  {/if}
</section>

<section class="list-section">
  <h2 class="list-header">All checkins</h2>
  {#if data.checkins}
    <ul class="margin-top-lg">
      {#each data.checkins as checkin}
        <li><CheckinPlacard {checkin} /></li>
      {/each}
    </ul>
  {:else}
    <p>No checkins.</p>
  {/if}
</section>
