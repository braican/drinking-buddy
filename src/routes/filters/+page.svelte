<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { states, styleOptGroups, styles } from '@utils/constants';
  import { ApiRequest, createQueryString } from '@utils';
  import { Tabs, BeerList, CheckinList, BreweryPlacard } from '@components';
  import { FiltersIcon } from '@icons';
  import type { BeerWithData, Brewery, PaginatedCheckins, FilterParameters } from '@types';

  const filterControls: FilterParameters = {
    style: '',
    state: '',
    year: '',
  };

  let filters: FilterParameters = {
    style: '',
    state: '',
    year: '',
  };

  let paginatedCheckins: PaginatedCheckins = null;
  let beers: BeerWithData[] = [];
  let breweries: (Brewery & { beers: BeerWithData[] })[] = [];
  let filteredAverage = null;

  let filtered = false;
  let loading = true;

  onMount(async () => {
    const queryFilters = $page.url.searchParams;

    Object.keys(filterControls).forEach(key => {
      filterControls[key] = queryFilters.get(key) || '';
    });

    if (Object.values(filterControls).some(v => v)) {
      await filter();
    }

    loading = false;
  });

  const filter = async () => {
    if (Object.entries(filterControls).every(([k, v]) => v === filters[k])) return;

    const req = new ApiRequest();
    loading = true;

    const [filterData, filteredCheckinData] = await Promise.all([
      req.get<{
        beers: BeerWithData[];
        breweries: (Brewery & { beers: BeerWithData[] })[];
        filteredAverage: string;
      }>(`filter?${createQueryString(filterControls)}`),
      req.get<PaginatedCheckins>(`filter/checkins?${createQueryString(filterControls)}`),
    ]);

    Object.entries(filterControls).forEach(([k, v]) => {
      if (v) {
        $page.url.searchParams.set(k, v);
      } else {
        $page.url.searchParams.delete(k);
      }
    });

    goto(`?${$page.url.searchParams.toString()}`);

    beers = filterData.beers;
    breweries = filterData.breweries;
    filteredAverage = filterData.filteredAverage;
    paginatedCheckins = filteredCheckinData;
    filters = { ...filterControls };
    filtered = true;
    loading = false;
  };
</script>

<header class="padding-bottom-lg">
  <h1>Filters</h1>

  <div class="inline-items margin-top-lg">
    <div>
      <label class="fs-xs block-label" for="filter-style">Style:</label>
      <select bind:value={filterControls.style} id="filter-style">
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
      <select bind:value={filterControls.state} id="filter-state">
        <option value="">Choose State</option>

        {#each Object.entries(states) as [code, state]}
          <option value={code}>{state}</option>
        {/each}
      </select>
    </div>

    <div>
      <label class="fs-xs block-label" for="filter-year">Year:</label>
      <select bind:value={filterControls.year} id="filter-year">
        <option value="">Choose Year</option>

        {#each Array.from({ length: new Date().getFullYear() - 2013 + 1 }, (_, index) => 2013 + index) as yr}
          <option value={yr.toString()}>{yr}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if Object.values(filterControls).some(v => v)}
    <p class="margin-top-md">
      <button
        on:click={filter}
        disabled={loading || Object.entries(filterControls).every(([k, v]) => v === filters[k])}
        class="button button-translucent button-inline-icon">
        {#if filterControls.year && !filterControls.style && !filterControls.state}
          See stats from {filterControls.year}
        {:else}
          {#if filterControls.style && filterControls.state}
            Filter {filterControls.style}s from {states[filterControls.state]}
          {:else if filterControls.style}
            Filter {filterControls.style}s
          {:else if filterControls.state}
            Filter beers from {states[filterControls.state]}
          {/if}
          {#if filterControls.year}
            from {filterControls.year}
          {/if}
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
      {#if filters.year}
        In {filters.year}, you
      {:else}
        You've
      {/if}
      checked in {paginatedCheckins.count.toLocaleString()}
      {filters.style || 'beer'}{beers.length === 1 ? '' : 's'}{filters.state
        ? ` from ${states[filters.state]}`
        : ''} across {beers.length.toLocaleString()}{beers.length > 1 ? ' different' : ''}
      {beers.length === 1 ? 'beer' : 'beers'} from {breweries.length.toLocaleString()}
      different {breweries.length === 1 ? 'brewery' : 'breweries'}. Your average rating of these is
      <strong>{filteredAverage}</strong>.
    </p>

    <Tabs views={['Beers', 'Checkins', 'Breweries']} let:view>
      {#if view === 'Checkins'}
        {#if paginatedCheckins?.checkins.length > 0}
          <CheckinList checkinData={paginatedCheckins} filterQuery={filterControls} />
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
      {#if filters.year}
        You did not have
      {:else}
        You've not had
      {/if}
      any {filters.style || 'beer'}{beers.length === 1 ? '' : 's'}{filters.state
        ? ` from ${states[filters.state]}`
        : ''}{#if filters.year}in {filters.year}{/if}.
    </p>
  {/if}
</main>
