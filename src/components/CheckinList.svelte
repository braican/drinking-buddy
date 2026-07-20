<script lang="ts">
  import { CheckinPlacard } from '@components';
  import { ApiRequest, createQueryString } from '@utils';
  import type { PaginatedCheckins, FilterParameters, CheckinWithData } from '@types';

  interface Props {
    checkinData: PaginatedCheckins;
    breweryId?: number;
    beerId?: number;
    venueId?: number;
    filterQuery?: FilterParameters;
  }

  let {
    checkinData,
    breweryId = null,
    beerId = null,
    venueId = null,
    filterQuery = null,
  }: Props = $props();

  let currentPage = $state(1);
  let additionalCheckins = $state<CheckinWithData[]>([]);
  let loading = $state(false);

  const allCheckins = $derived([...checkinData.checkins, ...additionalCheckins]);
  const totalPages = $derived(Math.ceil(checkinData.count / checkinData.checkins.length));
  const loadingButtonText = $derived(
    loading ? 'Loading...' : `Load page ${currentPage + 1} of ${totalPages}`,
  );

  const loadMore = async () => {
    loading = true;

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
    loading = false;
    if (newCheckins) {
      additionalCheckins = [...additionalCheckins, ...newCheckins.checkins];
    }
  };
</script>

<h2 class="list-header">
  {checkinData.count.toLocaleString()} Checkin{checkinData.count !== 1 ? 's' : ''}
</h2>

<ul class="margin-top-lg">
  {#each allCheckins as checkin (checkin.id)}
    <li><CheckinPlacard {checkin} showVenue={venueId === null} light={beerId !== null} /></li>
  {/each}
</ul>

{#if (breweryId || beerId || venueId || filterQuery) && currentPage < totalPages}
  <p class="margin-top-lg">
    <button class="button button-translucent button-full" onclick={loadMore}>
      {loadingButtonText}
    </button>
  </p>
{/if}
