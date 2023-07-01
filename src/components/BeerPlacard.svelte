<script lang="ts">
  import { formatDate } from '@utils';
  import type { BreweryBeer } from '@app';

  export let beer: BreweryBeer;

  const rating = (
    beer.checkins.reduce((c, { rating }) => rating + c, 0) / beer.checkins.length
  ).toFixed(2);
</script>

<article data-beer-id={beer.id}>
  <p>{beer.name}</p>
  <p>{beer.style}</p>
  <p>{beer.abv}</p>
  <p>Last had: {formatDate(beer.lastHad.toString())}</p>

  <p>Count: {beer.checkins.length}</p>
  <p>Rating: {rating}</p>
</article>
