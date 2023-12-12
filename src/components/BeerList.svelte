<script lang="ts">
  import { BeerPlacard } from '@components';
  import type { BeerWithData } from '@types';

  export let beers: BeerWithData[];
  export let showBreweries = true;
  let sort = 'Alphabetical';

  const sortOptions = ['Alphabetical', 'Highest rated', 'Most hads', 'Most recent'];

  $: sortedBeers = async () => {
    switch (sort) {
      case 'Alphabetical':
        return beers.sort((a, b) => (a.name > b.name ? 1 : -1));
      case 'Highest rated':
        return beers.sort((a, b) => (a.average > b.average ? -1 : 1));
      case 'Most recent':
        return beers.sort((a, b) => (a.last_had > b.last_had ? -1 : 1));
      default:
        return beers.sort((a, b) => (a.hads > b.hads ? -1 : 1));
    }
  };
</script>

<section class="list-section">
  <header class="beer-header">
    <h2 class="list-header">{beers.length} beers</h2>
    <div class="text-align-right">
      <label class="fs-xs block-label" for="brewery-beer-sort">Sort by:</label>
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
          <li><BeerPlacard {beer} showBrewery={showBreweries} /></li>
        {/each}
      </ul>
    {:else}
      <p>No beers.</p>
    {/if}
  {/await}
</section>

<style lang="scss">
  .beer-header {
    display: flex;
    justify-content: space-between;
  }
</style>
