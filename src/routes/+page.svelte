<script lang="ts">
  import { checkinStore, breweryStore } from '@stores';
  const { latestCheckins } = checkinStore;
  const { bestBreweries, popularBreweries } = breweryStore;
</script>

<section>
  <h2>Latest checkins</h2>

  {#if $latestCheckins}
    <ul>
      {#each $latestCheckins as checkin}
        <li data-checkin-id={checkin.id}>
          <span class="brewery-name">{checkin.brewery.name}</span>
          <span class="brewery-name">{checkin.beer.name}</span>
        </li>
      {/each}
    </ul>
  {/if}

  {#if $bestBreweries}
    <h2>Best Breweries</h2>
    <ul>
      {#each $bestBreweries as brewery}
        <li data-brewery-id={brewery.id}>
          <span class="brewery-name">{brewery.name}</span>
          <span class="brewery-name">{brewery.average.toFixed(2)}</span>
          <span class="brewery-name">{brewery.checkinCount}</span>
        </li>
      {/each}
    </ul>
  {/if}

  {#if $popularBreweries}
    <h2>Most Popular Breweries</h2>
    <ul>
      {#each $popularBreweries as brewery}
        <li data-brewery-id={brewery.id}>
          <span class="brewery-name">{brewery.name}</span>
          <span class="brewery-name">{brewery.average.toFixed(2)}</span>
          <span class="brewery-name">{brewery.checkinCount}</span>
        </li>
      {/each}
    </ul>
  {/if}
</section>
