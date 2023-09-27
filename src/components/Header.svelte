<script lang="ts">
  import { fade } from 'svelte/transition';
  import { RefreshIcon } from '@icons';
  import { Request, formatDate } from '@utils';
  import { userStore as user, checkinStore, breweryStore } from '@stores';
  import type { Checkin, User } from '@models';
  import type { UntappdUser } from '@lib/UntappdClient';

  let isRefreshing = false;
  let refreshButtonText = 'Refresh';
  let refreshStatus = '';

  const refresh = async () => {
    isRefreshing = true;
    refreshButtonText = 'Refreshing...';
    refreshStatus = 'Starting to fetch...';
    console.log('Refreshing database with the latest from Untappd...');

    try {
      const { untappdUser, dbCheckins, lastDbCheckin } = await Request.get<{
        untappdUser: UntappdUser;
        dbCheckins: number;
        lastDbCheckin: Checkin;
      }>('/api/checkins/pre-fetch');

      console.log('Realtime user checkins (from Untappd):', untappdUser?.stats?.total_checkins);
      console.log('Checkins in database:', dbCheckins);

      if (untappdUser.stats.total_checkins === dbCheckins) {
        refreshStatus = 'All checkins are accounted for.';
        refreshButtonText = 'Refresh';
        isRefreshing = false;
        setTimeout(() => (refreshStatus = ''), 2000);
        return;
      }

      refreshStatus = `Fetching ${untappdUser.stats.total_checkins - dbCheckins} checkins...`;

      const { newCheckins } = await Request.post<{ newCheckins: Checkin[] }>(
        '/api/checkins/fetch',
        { lastDbCheckin },
      );

      const [{ totalAdded }, { user: newUser }] = await Promise.all([
        Request.post<{ totalAdded: number }>('/api/checkins/add', { newCheckins }),
        Request.post<{ user: User }>('/api/user', { untappdUser }),
      ]);

      user.set(newUser);

      await checkinStore.refresh();
      await breweryStore.refresh();

      refreshStatus = `Added ${totalAdded} checkins to database.`;
      setTimeout(() => (refreshStatus = ''), 2000);
    } catch (error) {
      console.error('There was a problem fetching the data.', error);
      refreshStatus = `There was a problem fetching the data.`;
      setTimeout(() => (refreshStatus = ''), 2000);
    }

    refreshButtonText = 'Refresh';
    isRefreshing = false;
  };
</script>

<header class="header padding-base">
  {#if $user}
    <figure class="user-photo">
      <a href="/"><img src={$user.avatar} alt="Nick Braica's Untappd profile." /></a>
    </figure>

    <div class="stats">
      <p class="fs-sm">Checkins: <strong>{$user.checkins?.toLocaleString()}</strong></p>
      <p class="fs-sm">Beers: <strong>{$user.beers?.toLocaleString()}</strong></p>

      <button
        aria-label="Refresh checkins"
        on:click={refresh}
        class:loading={isRefreshing}
        class="button refresh-button button-orange">
        <RefreshIcon />
        <span class="fs-sm">{refreshButtonText}</span>
      </button>

      <p class="fs-xs status-message">
        {#key refreshStatus}
          <span class="fade-transition" transition:fade
            >{refreshStatus || `Last updated: ${formatDate($user.lastUpdated?.toString())}`}</span>
        {/key}
        &nbsp;
      </p>
    </div>
  {/if}
</header>

<style lang="scss">
  .header {
    border-top: 2px solid var(--color-primary);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-base);
  }

  .stats {
    text-align: right;
    flex: 1;
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
    margin: var(--spacing-sm) 0 var(--spacing-sm) auto;

    :global(svg) {
      display: block;
      width: 20px;
    }
  }

  .loading {
    background-color: transparent;

    :global(svg) {
      animation: spin 2s linear infinite;
    }
  }

  .status-message {
    position: relative;
  }

  .fade-transition {
    position: absolute;
    display: inline-block;
    right: 0;
    top: 0;
    white-space: nowrap;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
