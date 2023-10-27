<script lang="ts">
  import type { Checkin } from '@models';
  import type { BreweryBeer } from '@app';
  import { states, styles } from '@utils/constants';
  import { ApiRequest, beerRating } from '@utils';
  import { Tabs, BeerList, CheckinPlacard } from '@components';
  import { FiltersIcon } from '@icons';
  let style = '';
  let state = '';

  let filteredStyle = '';
  let filteredState = '';

  let checkins = [];
  let beers = [];
  let breweries = [];

  let filtered = false;
  let loading = false;

  const filter = async () => {
    if (style === filteredStyle && state === filteredState) return;

    const req = new ApiRequest();
    loading = true;

    const results = await req.get<{
      checkins: Checkin[];
      beers: BreweryBeer[];
      breweries: { slug: string; name: string; beers: number; averageRating: number }[];
    }>(
      `filter?${new URLSearchParams({
        ...(style && { style }),
        ...(state && { state }),
      })}`,
    );

    filteredStyle = style;
    filteredState = state;

    filtered = true;
    loading = false;
    checkins = results.checkins;
    beers = results.beers;
    breweries = results.breweries;
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
    <p>Use the filters to drill down.</p>
  {:else if checkins.length > 0}
    <p class="margin-bottom-lg fs-sm">
      You've had {beers.length.toLocaleString()}{beers.length > 1 ? ' different' : ''}
      {filteredStyle} beer{beers.length === 1 ? '' : 's'}{filteredState
        ? ` from ${states[filteredState]}`
        : ''}, from {breweries.length.toLocaleString()} different brewer{breweries.length === 1
        ? 'y'
        : 'ies'}.
    </p>

    <Tabs views={['Beers', 'Checkins', 'Breweries']} let:view>
      {#if view === 'Checkins'}
        {#if filtered && checkins.length}
          <h2 class="list-header">{checkins.length.toLocaleString()} Checkins</h2>
          <ul class="margin-top-lg">
            {#each checkins as checkin}
              <li><CheckinPlacard {checkin} /></li>
            {/each}
          </ul>
        {/if}
      {:else if view === 'Beers'}
        <BeerList {beers} />
      {:else if view === 'Breweries'}
        <ul>
          {#each breweries as brewery}
            <li>
              <article class="brewery-listing padding-base">
                <span class="fs-lg brewery-name">
                  <a class="link" href={`/brewery/${brewery.slug}`}>{brewery.name}</a>
                </span>
                <div class="brewery-average">
                  <span class="fs-lg ff-mono">{brewery.averageRating}</span>
                  <p class="fs-sm">average rating</p>
                </div>
                <span class="fs-sm color-opacity-50 brewery-count">
                  Total beers: {brewery.beers}
                </span>
              </article>
            </li>
          {/each}
        </ul>
      {/if}
    </Tabs>
  {:else}
    <p>You've not had any {style} beers{state ? ` from ${states[state]}` : ''}</p>
  {/if}
</main>

<style lang="scss">
  .brewery-listing {
    display: grid;
    grid-template:
      'name average'
      'count average' /
      auto 100px;
    gap: var(--spacing-sm);
    border-top: 1px solid var(--color-white-15);
  }

  .brewery-name {
    grid-area: name;
  }
  .brewery-average {
    grid-area: average;
    text-align: right;
  }
  .brewery-count {
    grid-area: count;
  }
</style>
