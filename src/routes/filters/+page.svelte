<script lang="ts">
  import { states, styleOptGroups } from '@utils/constants';
  import { ApiRequest } from '@utils';
  import { Tabs, BeerList, CheckinPlacard, BreweryPlacard } from '@components';
  import { FiltersIcon } from '@icons';
  import type { BeerWithData, Brewery, CheckinWithData } from '@types';
  let style = '';
  let state = '';

  let filteredStyle = '';
  let filteredState = '';

  let checkins: CheckinWithData[] = [];
  let beers: BeerWithData[] = [];
  let breweries: (Brewery & { beers: BeerWithData[] })[] = [];
  let filteredAverage = null;

  let filtered = false;
  let loading = false;

  const filter = async () => {
    if (style === filteredStyle && state === filteredState) return;
    const req = new ApiRequest();
    loading = true;

    const results = await req.get<{
      checkins: CheckinWithData[];
      beers: BeerWithData[];
      breweries: (Brewery & { beers: BeerWithData[] })[];
      filteredAverage: string;
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
    filteredAverage = results.filteredAverage;
  };
</script>

<header class="padding-bottom-lg">
  <h1>Filters</h1>

  <div class="inline-items margin-top-lg">
    <div>
      <label class="fs-xs block-label" for="filter-style">Style:</label>
      <select bind:value={style} id="filter-style">
        <option value="">Choose Style</option>

        {#each styleOptGroups as group}
          <optgroup label={group.group}>
            {#each group.styles as style}
              <option value={style}>{style}</option>
            {/each}
          </optgroup>
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
          Filter {style}s from {states[state]}
        {:else if style}
          Filter {style}s
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
      {filteredStyle}{beers.length === 1 ? '' : 's'}{filteredState
        ? ` from ${states[filteredState]}`
        : ''} from {breweries.length.toLocaleString()} different brewer{breweries.length === 1
        ? 'y'
        : 'ies'}. Your average rating of these is {filteredAverage}.
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
        <h2 class="list-header">{breweries.length} breweries</h2>
        <p class="fs-sm color-opacity-50 list-header-subhead">listed by rating</p>

        <ul class="margin-top-lg">
          {#each breweries as brewery}
            <li>
              <BreweryPlacard {brewery} filtered={true} />
            </li>
          {/each}
        </ul>
      {/if}
    </Tabs>
  {:else}
    <p>You've not had any {style} beers{state ? ` from ${states[state]}` : ''}</p>
  {/if}
</main>
