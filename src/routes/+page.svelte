<script lang="ts">
  import { checkinStore } from '@stores';
  const { latestCheckins } = checkinStore;
</script>

<section>
  <h2>Latest checkins</h2>

  {#if $latestCheckins}
    <ul>
      {#each $latestCheckins as checkin}
        <li>
          <span class="brewery-name">{checkin.brewery.name}</span>
          <span class="brewery-name">{checkin.beer.name}</span>
        </li>
      {/each}
    </ul>
  {/if}
</section>
