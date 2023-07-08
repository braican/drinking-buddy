<script lang="ts">
  import { onMount } from 'svelte';
  import { checkinStore, breweryStore } from '@stores';
  import { Tabs, BreweryPlacard, CheckinPlacard } from '@components';

  let storesLoaded = false;

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
    <Tabs views={['Breweries', 'Checkins']} let:view>
      {#if view === 'Checkins'}
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
      {:else if view === 'Breweries'}
        <section class="list-section">
          <h2 class="list-header">Highest Rated</h2>
          {#if $bestBreweries}
            <ul class="margin-top-lg">
              {#each $bestBreweries as brewery}
                <li><BreweryPlacard {brewery} /></li>
              {/each}
            </ul>
          {/if}
        </section>

        <section class="list-section">
          <h2 class="list-header">Most Popular</h2>
          {#if $popularBreweries}
            <ul class="margin-top-lg">
              {#each $popularBreweries as brewery}
                <li><BreweryPlacard {brewery} /></li>
              {/each}
            </ul>
          {/if}
        </section>
      {/if}
    </Tabs>
  {/if}
</div>
