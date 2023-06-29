<script lang="ts">
  import { onMount } from 'svelte';
  import { checkinStore, breweryStore } from '@stores';
  import { BreweryPlacard, CheckinPlacard } from '@components';

  const views = ['Stats', 'Checkins'];

  let storesLoaded = false;
  let activeView = views[0];

  onMount(async () => {
    await Promise.all([checkinStore.refreshLatest(), breweryStore.refresh()]);
    storesLoaded = true;
  });

  const { latestCheckins } = checkinStore;
  const { bestBreweries, popularBreweries } = breweryStore;
</script>

<div>
  {#if !storesLoaded}
    <p>Loading...</p>
  {:else}
    <nav class="margin-bottom-xl">
      <ul class="home-tabs">
        {#each views as view}
          <li>
            <button
              class:button-translucent--active={view === activeView}
              class="button button-translucent"
              aria-label={`Change to ${view} view`}
              on:click={() => (activeView = view)}>{view}</button>
          </li>
        {/each}
      </ul>
    </nav>

    {#if activeView === 'Checkins'}
      <section class="list-section">
        <h2 class="list-header">Latest checkins</h2>
        {#if $latestCheckins}
          <ul class="margin-top-lg">
            {#each $latestCheckins as checkin}
              <li><CheckinPlacard {checkin} /></li>
            {/each}
          </ul>
        {:else}
          <p>No checkins.</p>
        {/if}
      </section>
    {:else if activeView === 'Stats'}
      <section class="list-section">
        <h2 class="list-header">Best Breweries</h2>
        {#if $bestBreweries}
          <ul class="margin-top-lg">
            {#each $bestBreweries as brewery}
              <li><BreweryPlacard {brewery} /></li>
            {/each}
          </ul>
        {/if}
      </section>

      <section class="list-section">
        <h2 class="list-header">Most Popular Breweries</h2>
        {#if $popularBreweries}
          <ul class="margin-top-lg">
            {#each $popularBreweries as brewery}
              <li><BreweryPlacard {brewery} /></li>
            {/each}
          </ul>
        {/if}
      </section>
    {/if}
  {/if}
</div>

<style lang="scss">
  .home-tabs {
    display: flex;
    gap: var(--spacing-base);
  }
</style>
