<script lang="ts">
  import { CheckinPlacard } from '@components';
  export let data;

  let checkinsLoaded = false;
  let rating = null;
  let hads = 0;

  data.streamed.checkinData.then(ch => {
    const ratedCheckins = ch.filter(ch => ch.rating !== 0);
    checkinsLoaded = true;

    hads = ch.length;

    rating = (
      ratedCheckins.reduce((acc, curr) => acc + curr.rating, 0) / ratedCheckins.length
    ).toFixed(2);
  });
</script>

<header class="padding-bottom-lg">
  {#await data.streamed.beerData}
    <h1 class="loading-name">{data.slug}</h1>
  {:then beerData}
    <div class="beer-header">
      <p class="brewery-name">
        <a class="link" href={`/brewery/${beerData.brewery.slug}`}
          >&larr; {beerData.brewery.name}</a>
      </p>
      <h1>{beerData.beer.name}</h1>

      {#if beerData.beer.label}
        <img
          src={beerData.beer.label.replace('untappd.akamaized.net', 'assets.untappd.com')}
          alt={beerData.beer.name} />
      {/if}
    </div>

    {#if checkinsLoaded}
      <p class="margin-top-md">Rating: <strong>{rating}</strong></p>
      <p class="margin-top-sm">Hads: <strong>{hads}</strong></p>
    {/if}
  {:catch}
    <h1>No beer found!</h1>
  {/await}
</header>

{#await data.streamed.beerData then}
  {#await data.streamed.checkinData}
    <p class="margin-top-lg">Loading...</p>
  {:then checkinData}
    <section class="list-section">
      <h2 class="list-header">Checkins</h2>

      {#if checkinData.length > 0}
        <ul class="margin-top-lg">
          {#each checkinData as checkin}
            <li><CheckinPlacard {checkin} light /></li>
          {/each}
        </ul>
      {:else}
        <p class="margin-top-lg">No checkins</p>
      {/if}
    </section>
  {/await}
{/await}

<style lang="scss">
  .beer-header {
    display: grid;
    gap: var(--spacing-base);
    grid-template-columns: auto 60px;
    grid-template-rows: auto auto;

    .brewery-name {
      grid-column: 1 / span 2;
    }
  }
</style>
