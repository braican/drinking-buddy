<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { states, styleOptGroups } from '@utils/constants';
  import { ApiRequest, createQueryString } from '@utils';
  import { Tabs, BeerList, CheckinList, BreweryPlacard } from '@components';
  import { FiltersIcon } from '@icons';
  import type { BeerWithData, Brewery, PaginatedCheckins } from '@types';
  let style = '';
  let state = '';

  let filteredStyle = '';
  let filteredState = '';

  let paginatedCheckins: PaginatedCheckins = null;
  let beers: BeerWithData[] = [];
  let breweries: (Brewery & { beers: BeerWithData[] })[] = [];
  let filteredAverage = null;

  let filtered = false;
  let loading = true;

  onMount(async () => {
    const queryFilters = $page.url.searchParams;

    style = queryFilters.get('style') || '';
    state = queryFilters.get('state') || '';

    if (style || state) {
      await filter();
    }

    loading = false;
  });

  const filter = async () => {
    if (style === filteredStyle && state === filteredState) return;

    const req = new ApiRequest();
    loading = true;

    const [filterData, filteredCheckinData] = await Promise.all([
      req.get<{
        beers: BeerWithData[];
        breweries: (Brewery & { beers: BeerWithData[] })[];
        filteredAverage: string;
      }>(`filter?${createQueryString({ style, state })}`),
      req.get<PaginatedCheckins>(`filter/checkins?${createQueryString({ style, state })}`),
    ]);

    if (style) {
      $page.url.searchParams.set('style', style);
    } else {
      $page.url.searchParams.delete('style');
    }
    if (state) {
      $page.url.searchParams.set('state', state);
    } else {
      $page.url.searchParams.delete('state');
    }
    goto(`?${$page.url.searchParams.toString()}`);

    beers = filterData.beers;
    breweries = filterData.breweries;
    filteredAverage = filterData.filteredAverage;
    paginatedCheckins = filteredCheckinData;

    filteredStyle = style;
    filteredState = state;
    filtered = true;
    loading = false;
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
  {:else if paginatedCheckins?.checkins.length > 0}
    <p class="margin-bottom-lg fs-sm">
      You've checked in {paginatedCheckins.count.toLocaleString()}
      {filteredStyle || 'beer'}{beers.length === 1 ? '' : 's'}{filteredState
        ? ` from ${states[filteredState]}`
        : ''} across {beers.length.toLocaleString()}{beers.length > 1 ? ' different' : ''}
      {beers.length === 1 ? 'beer' : 'beers'} from {breweries.length.toLocaleString()}
      different {breweries.length === 1 ? 'brewery' : 'breweries'}. Your average rating of these is {filteredAverage}.
    </p>

    <Tabs views={['Beers', 'Checkins', 'Breweries']} let:view>
      {#if view === 'Checkins'}
        {#if paginatedCheckins?.checkins.length > 0}
          <CheckinList checkinData={paginatedCheckins} filterQuery={{ style, state }} />
        {/if}
      {:else if view === 'Beers'}
        <BeerList {beers} />
      {:else if view === 'Breweries'}
        <h2 class="list-header">
          {breweries.length.toLocaleString()} Brewer{breweries.length === 1 ? 'y' : 'ies'}
        </h2>
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
    <p>
      You've not had any {filteredStyle || 'beer'}{beers.length === 1 ? '' : 's'}{filteredState
        ? ` from ${states[filteredState]}`
        : ''}
    </p>
  {/if}
</main>
