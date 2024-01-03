<script lang="ts">
  import { onMount } from 'svelte';
  import { checkinStore, breweryStore } from '@stores';
  import { Tabs, BreweryPlacard, CheckinPlacard } from '@components';

  let storesLoaded = false;
  let allTime = false;

  onMount(async () => {
    await Promise.all([checkinStore.refresh(), breweryStore.refresh()]);
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
        <div>
          <button on:click={() => (allTime = true)}>All time</button>
          <button on:click={() => (allTime = false)}>Recent</button>
        </div>
        <div class="split split--50-50">
          <section class="list-section">
            <h2 class="list-header">Highest Rated</h2>
            <ul class="margin-top-lg">
              {#each allTime ? $bestBreweries.allTime : $bestBreweries.recent as brewery}
                <li><BreweryPlacard {brewery} /></li>
              {/each}
            </ul>
          </section>

          <section class="list-section">
            <h2 class="list-header">Most Popular</h2>
            {#if allTime}
              {#if $popularBreweries}
                <ul class="margin-top-lg">
                  {#each allTime ? $popularBreweries.allTime : $popularBreweries.recent as brewery}
                    <li><BreweryPlacard {brewery} /></li>
                  {/each}
                </ul>
              {/if}
            {:else}
              recents
            {/if}
          </section>
        </div>
      {/if}
    </Tabs>
  {/if}
</div>
