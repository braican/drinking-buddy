<script lang="ts">
  import type { Checkin } from '@models';
  import type { BreweryBeer } from '@app';
  import { states, styles } from '@utils/constants';
  import { ApiRequest, beerRating } from '@utils';
  import { Tabs, BreweryPlacard, BeerPlacard, CheckinPlacard } from '@components';
  import { FiltersIcon } from '@icons';
  let style = '';
  let state = '';

  let checkins = [];
  let beers = [];
  let filtered = false;
  let loading = false;

  let sort = 'Alphabetical';

  const sortOptions = ['Alphabetical', 'Highest rated', 'Most hads'];

  const filter = async () => {
    const req = new ApiRequest();
    loading = true;

    const results = await req.get<{ checkins: Checkin[]; beers: BreweryBeer[] }>(
      `filter?${new URLSearchParams({
        ...(style && { style }),
        ...(state && { state }),
      })}`,
    );

    filtered = true;
    loading = false;
    checkins = results.checkins;
    beers = results.beers;
  };

  $: sortedBeers = async () => {
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
  <h1>Filters</h1>

  <div class="inline-items margin-top-lg">
    <div>
      <label class="fs-xs block-label" for="filter-style">Style:</label>
      <select bind:value={style} id="filter-style">
        <option value="">Choose Style</option>

        {#each Object.keys(styles) as style}
          <option value={style}>{style}</option>
        {/each}
      </select>
    </div>

    <div>
      <label class="fs-xs block-label" for="filter-state">State:</label>
      <select bind:value={state} id="filter-state">
        <option value="">Choose State</option>

        {#each Object.entries(states) as [code, state]}
          <option value={code}>{state}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if style || state}
    <p class="margin-top-md">
      <button
        on:click={filter}
        disabled={loading}
        class="button button-translucent button-inline-icon">
        {#if style && state}
          Filter {style} beers from {states[state]}
        {:else if style}
          Filter {style} beers
        {:else if state}
          Filter beers from {states[state]}
        {/if}

        <span class="icon"><FiltersIcon /></span>
      </button>
    </p>
  {/if}
</header>

<main>
  {#if loading}
    <p>Loading...</p>
  {:else if !filtered}
    <p>Use the filters to find your checkins.</p>
  {:else}
    <Tabs views={['Beers', 'Checkins', 'Breweries']} let:view>
      {#if view === 'Checkins'}
        {#if filtered && checkins.length}
          <ul class="margin-top-lg">
            {#each checkins as checkin}
              <li><CheckinPlacard {checkin} /></li>
            {/each}
          </ul>
        {:else}
          <p>No checkins match that filter.</p>
        {/if}
      {:else if view === 'Beers'}
        <section class="list-section">
          <header class="beer-header">
            <h2 class="list-header">Beers</h2>
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
                  <li><BeerPlacard {beer} /></li>
                {/each}
              </ul>
            {:else}
              <p>No beers.</p>
            {/if}
          {/await}
        </section>
      {:else if view === 'Breweries'}
        <p>Breweries here</p>
      {/if}
    </Tabs>
  {/if}
</main>
