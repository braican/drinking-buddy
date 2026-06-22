<script lang="ts">
  import { Tabs, BreweryPlacard, CheckinPlacard } from '@components';

  let { data } = $props();
  let allTime = $state(false);
</script>

<div>
  <Tabs views={['Breweries', 'Checkins']}>
    {#snippet children(view)}
      {#if view === 'Checkins'}
        <section class="list-section">
          <h2 class="list-header">Latest checkins</h2>
          {#if data.latestCheckins?.length}
            <ul class="margin-top-lg">
              {#each data.latestCheckins as checkin}
                <li><CheckinPlacard {checkin} /></li>
              {/each}
            </ul>
          {:else}
            <p>No checkins.</p>
          {/if}
        </section>
      {:else if view === 'Breweries'}
        <div class="margin-bottom-lg">
          <button
            class:button-translucent--active={!allTime}
            class="button button-translucent"
            onclick={() => (allTime = false)}>Recent</button>
          <button
            class:button-translucent--active={allTime}
            class="button button-translucent"
            onclick={() => (allTime = true)}>All time</button>
        </div>

        <p class="margin-bottom-xl">
          {#if allTime}
            Ratings based on all checkins.
          {:else}
            Ratings based on the last 1,000 checkins.
          {/if}
        </p>

        {#if allTime}
          <div class="split split--50-50">
            <section class="list-section">
              <h2 class="list-header">Highest Rated</h2>
              <ul class="margin-top-lg">
                {#each data.bestBreweries.allTime as brewery}
                  <li><BreweryPlacard {brewery} /></li>
                {/each}
              </ul>
            </section>

            <section class="list-section">
              <h2 class="list-header">Most Popular</h2>
              <ul class="margin-top-lg">
                {#each data.popularBreweries.allTime as brewery}
                  <li><BreweryPlacard {brewery} /></li>
                {/each}
              </ul>
            </section>
          </div>
        {:else}
          {#await data.streamed.recentStats}
            <p>Loading...</p>
          {:then recentStats}
            <div class="split split--50-50">
              <section class="list-section">
                <h2 class="list-header">Highest Rated</h2>
                <ul class="margin-top-lg">
                  {#each recentStats?.bestBreweries ?? [] as brewery}
                    <li><BreweryPlacard {brewery} /></li>
                  {/each}
                </ul>
              </section>

              <section class="list-section">
                <h2 class="list-header">Most Popular</h2>
                <ul class="margin-top-lg">
                  {#each recentStats?.popularBreweries ?? [] as brewery}
                    <li><BreweryPlacard {brewery} /></li>
                  {/each}
                </ul>
              </section>
            </div>
          {/await}
        {/if}
      {/if}
    {/snippet}
  </Tabs>
</div>
