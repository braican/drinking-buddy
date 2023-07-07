<script lang="ts">
  import { Tabs, BeerPlacard, CheckinPlacard } from '@components';
  import { beerRating } from '@utils';

  export let data;
  let sort = 'Alphabetical';

  const sortOptions = ['Alphabetical', 'Highest rated', 'Most hads'];

  $: sortedBeers = async () => {
    const { beers } = await data.streamed.stats;

    if (sort === 'Alphabetical') {
      return beers.sort((a, b) => (a.name > b.name ? 1 : -1));
    } else if (sort === 'Highest rated') {
      return beers.sort((a, b) => (beerRating(a) > beerRating(b) ? -1 : 1));
    } else {
      return beers.sort((a, b) => (a.checkins.length > b.checkins.length ? -1 : 1));
    }
  };
</script>

<header class="padding-bottom-lg">
  {#await data.streamed.brewery}
    <h1 class="loading-name">&nbsp;</h1>
  {:then brewery}
    <h1>{brewery.name}</h1>
  {/await}

  {#await data.streamed.stats}
    <p class="margin-top-lg">Loading...</p>
  {:then stats}
    <p class="margin-top-sm">Rating: <strong>{stats.rating}</strong></p>
    <p class="margin-top-sm">{stats.checkinCount} checkin{stats.checkinCount > 1 ? 's' : ''}</p>
    <p>{stats.beers.length} beer{stats.beers.length > 1 ? 's' : ''}</p>
  {/await}
</header>

{#await data.streamed.stats then stats}
  <Tabs views={['Beers', 'Checkins']} let:view>
    {#if view === 'Beers'}
      <section class="list-section">
        <header class="beer-header">
          <h2 class="list-header">Beers</h2>
          <div class="text-align-right">
            <label class="fs-xs sort-label" for="brewery-beer-sort">Sort by:</label>
            <select bind:value={sort} id="brweery-beer-sort">
              {#each sortOptions as sortOption}
                <option value={sortOption}>{sortOption}</option>
              {/each}
            </select>
          </div>
        </header>

        {#await sortedBeers() then sortedBeers}
          {#if sortedBeers}
            <ul class="margin-top-lg">
              {#each sortedBeers as beer}
                <li><BeerPlacard {beer} /></li>
              {/each}
            </ul>
          {:else}
            <p>No beers.</p>
          {/if}
        {/await}
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

<style lang="scss">
  .beer-header {
    display: flex;
    justify-content: space-between;
  }

  .sort-label {
    display: block;
  }

  .loading-name {
    width: 50vw;
    display: block;
    background-color: var(--color-white-alpha-20);
  }
</style>
