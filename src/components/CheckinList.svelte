<script lang="ts">
  import { CheckinPlacard } from '@components';
  import { ApiRequest } from '@utils';
  import type { PaginatedCheckins } from '@types';

  export let checkinData: PaginatedCheckins;
  export let breweryId: number = null;
  export let beerId: number = null;

  let { checkins } = checkinData;
  const totalPages = Math.ceil(checkinData.count / checkins.length);
  let currentPage = 1;
  let loadingButtonText = 'Load More';

  const loadMore = async () => {
    const req = new ApiRequest(fetch);

    loadingButtonText = 'Loading...';

    let endpoint = '';

    if (breweryId) {
      endpoint = `brewery/${breweryId}/checkins?page=${currentPage + 1}`;
    } else if (beerId) {
      endpoint = `beer/${beerId}/checkins?page=${currentPage + 1}`;
    }

    const newCheckins = await req.get<PaginatedCheckins>(endpoint);

    currentPage += 1;
    loadingButtonText = 'Load More';

    if (newCheckins) {
      checkins = [...checkins, ...newCheckins.checkins];
    }
  };
</script>

<h2 class="list-header">{checkinData.count} Checkins</h2>

<ul class="margin-top-lg">
  {#each checkins as checkin}
    <li><CheckinPlacard {checkin} /></li>
  {/each}
</ul>

{#if currentPage < totalPages}
  <p class="margin-top-lg">
    <button class="button button-translucent button-full" on:click={loadMore}>
      {loadingButtonText} ({totalPages} pages)
    </button>
  </p>
{/if}
