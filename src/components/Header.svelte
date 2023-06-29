<script lang="ts">
  import { RefreshIcon } from '@icons';
  import { Request, formatDate } from '@utils';
  import { userStore as user, checkinStore, breweryStore } from '@stores';
  import type { Checkin, User } from '@models';
  import type { UntappdUser } from '@lib/UntappdClient';

  const refresh = async () => {
    console.log('Refreshing database with the latest from Untappd...');

    try {
      const { untappdUser, dbCheckins, lastDbCheckin } = await Request.get<{
        untappdUser: UntappdUser;
        dbCheckins: number;
        lastDbCheckin: Checkin;
      }>('/api/checkins/pre-refresh');

      console.log('Realtime user checkins (from Untappd):', untappdUser?.stats?.total_checkins);
      console.log('Checkins in database:', dbCheckins);

      if (untappdUser.stats.total_checkins === dbCheckins) {
        console.log('All checkins are accounted for.');
        return;
      }

      console.log(`Fetching ${untappdUser.stats.total_checkins - dbCheckins} checkins...`);

      const { newCheckins } = await Request.post<{ newCheckins: Checkin[] }>(
        '/api/checkins/refresh',
        { lastDbCheckin },
      );

      console.log(`Fetched ${newCheckins.length} checkins from Untappd...`);

      const [{ totalAdded }, { user: newUser }] = await Promise.all([
        Request.post<{ totalAdded: number }>('/api/checkins/add', { newCheckins }),
        Request.post<{ user: User }>('/api/user', { untappdUser }),
      ]);

      user.set(newUser);

      await checkinStore.refreshLatest();
      await breweryStore.refresh();

      console.log(`Added ${totalAdded} checkins to database.`);
    } catch (error) {
      console.error('There was a problem fetching the data.', error);
    }
  };
</script>

<header class="header spacing-base">
  {#if $user}
    <figure class="user-photo">
      <img src={$user.avatar} alt="Nick Braica's Untappd profile." />
    </figure>

    <div class="stats">
      <p class="fs-sm">Checkins: <strong>{$user.checkins?.toLocaleString()}</strong></p>
      <p class="fs-sm">Beers: <strong>{$user.beers?.toLocaleString()}</strong></p>

      <button aria-label="Refresh checkins" on:click={refresh} class="refresh-button spacing-sm">
        <RefreshIcon />
        <span class="fs-sm">Refresh</span>
      </button>
      <p class="fs-xs">Last Updated: {formatDate($user.lastUpdated?.toString())}</p>
    </div>
  {/if}
</header>

<style lang="scss">
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-base);
  }

  .stats {
    text-align: right;
  }

  .user-photo {
    width: 60px;
    border-radius: 50%;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
    }
  }

  .refresh-button {
    display: flex;
    gap: 0.33em;
    align-items: center;
    line-height: 1;
    background-color: var(--color-primary);
    border-radius: var(--border-radius);
    margin: var(--spacing-sm) 0 var(--spacing-sm) auto;

    :global(svg) {
      width: 20px;
    }
  }
</style>
