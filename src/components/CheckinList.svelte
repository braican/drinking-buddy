<script lang="ts">
  import { CheckinPlacard } from '@components';
  import { ApiRequest, createQueryString } from '@utils';
  import type { PaginatedCheckins } from '@types';

  export let checkinData: PaginatedCheckins;
  export let breweryId: number = null;
  export let beerId: number = null;
  export let venueId: number = null;
  export let filterQuery: {
    state?: string;
    style?: string;
  } = null;

  let { checkins } = checkinData;
  const totalPages = Math.ceil(checkinData.count / checkins.length);
  let currentPage = 1;
  let loadingButtonText = `Load page ${currentPage + 1} of ${totalPages}`;

  const loadMore = async () => {
    loadingButtonText = 'Loading...';

    const req = new ApiRequest(fetch);

    let endpoint = '';
    if (breweryId) {
      endpoint = `brewery/${breweryId}/checkins?page=${currentPage + 1}`;
    } else if (beerId) {
      endpoint = `beer/${beerId}/checkins?page=${currentPage + 1}`;
    } else if (venueId) {
      endpoint = `venue/${venueId}/checkins?page=${currentPage + 1}`;
    } else if (filterQuery) {
      endpoint = `filter/checkins?page=${currentPage + 1}&${createQueryString(filterQuery)}`;
    }

    const newCheckins = await req.get<PaginatedCheckins>(endpoint);

    currentPage += 1;
    loadingButtonText = `Load page ${currentPage + 1} of ${totalPages}`;

    if (newCheckins) {
      checkins = [...checkins, ...newCheckins.checkins];
    }
  };
</script>

<h2 class="list-header">
  {checkinData.count.toLocaleString()} Checkin{checkinData.count !== 1 ? 's' : ''}
</h2>

<ul class="margin-top-lg">
  {#each checkins as checkin}
    <li><CheckinPlacard {checkin} showVenue={venueId === null} /></li>
  {/each}
</ul>

{#if (breweryId || beerId || venueId || filterQuery) && currentPage < totalPages}
  <p class="margin-top-lg">
    <button class="button button-translucent button-full" on:click={loadMore}>
      {loadingButtonText}
    </button>
  </p>
{/if}
