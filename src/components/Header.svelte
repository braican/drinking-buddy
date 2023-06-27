<script lang="ts">
  import { getContext } from 'svelte';
  import { RefreshIcon } from '@icons';
  import { Request } from '@utils';
  import type { User } from '@models';
  import type { Stores } from 'svelte/store';

  import type {
    ApiResponse,
    TigrisAddCheckinsResponse,
    UntappdPrefetchResponse,
    UntappdRefreshResponse,
  } from '../app';

  const user = getContext('user');

  const refresh = async () => {
    console.log('Refreshing database with the latest from Untappd...');

    try {
      const {
        data: { untappdUser, dbCheckins, lastDbCheckin },
      } = await Request.get<ApiResponse<UntappdPrefetchResponse>>('/api/untappd/prefetch');

      console.log('Realtime user checkins (from Untappd):', untappdUser.stats.total_checkins);
      console.log('Checkins in database:', dbCheckins);

      if (untappdUser.stats.total_checkins === dbCheckins) {
        console.log('All checkins are accounted for.');
        return;
      }

      console.log(`Fetching ${untappdUser.stats.total_checkins - dbCheckins} checkins...`);

      const {
        data: { newCheckins },
      } = await Request.post<ApiResponse<UntappdRefreshResponse>>('/api/untappd/refresh', {
        lastDbCheckin,
      });

      console.log(`Fetched ${newCheckins.length} checkins from Untappd...`);

      const [
        {
          data: { totalAdded },
        },
      ] = await Promise.all([
        Request.post<ApiResponse<TigrisAddCheckinsResponse>>('/api/tigris/add-checkins', {
          newCheckins,
        }),
        Request.post('/api/tigris/update-user', { untappdUser }),
      ]);

      console.log(`Added ${totalAdded} checkins to database.`);
    } catch (error) {
      console.error('There was a problem fetching the data.', error);
    }
  };
</script>

<header class="header padding-default">
  <figure class="user-photo">
    <img src={$user.avatar} alt="Nick Braica's Untappd profile." />
  </figure>

  <p>Checkins: {$user.checkins?.toLocaleString()} / Beers: {$user.beers?.toLocaleString()}</p>
  <p>Last Updated: {$user.lastUpdated || 'n/a'}</p>
  <button aria-label="Refresh checkins" on:click={refresh}>
    <RefreshIcon />
    <span>Refresh</span>
  </button>
</header>

<style lang="scss">
  .user-photo {
    width: 60px;
    border-radius: 50%;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
    }
  }
</style>
