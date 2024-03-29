<script lang="ts">
  import { fade } from 'svelte/transition';
  import { RefreshIcon } from '@icons';
  import { ApiRequest, formatDate } from '@utils';
  import { userStore as user, checkinStore, breweryStore } from '@stores';
  import type { UntappdUser, UntappdCheckinData, User } from '@types';

  let isRefreshing = false;
  let refreshButtonText = 'Refresh';
  let refreshStatus = '';

  const resetButton = (statusText = '') => {
    if (statusText) {
      refreshStatus = statusText;
    }

    setTimeout(() => (refreshStatus = ''), 2000);
    refreshButtonText = 'Refresh';
    isRefreshing = false;
  };

  const refresh = async () => {
    isRefreshing = true;
    refreshButtonText = 'Refreshing...';
    refreshStatus = 'Starting to fetch...';
    console.log('Refreshing database with the latest from Untappd...');

    try {
      const req = new ApiRequest();
      const { untappdUser, dbCheckinCount, lastDbCheckin } = await req.get<{
        untappdUser: UntappdUser;
        dbCheckinCount: number;
        lastDbCheckin: number;
      }>('checkins/pre-fetch');

      if (!untappdUser) {
        throw new Error('There was a problem fetching the user data.');
      }

      console.log('Realtime user checkins (from Untappd):', untappdUser.stats?.total_checkins);
      console.log('Checkins in database:', dbCheckinCount);
      if (untappdUser.stats?.total_checkins === dbCheckinCount) {
        return resetButton('All checkins are accounted for.');
      }

      refreshStatus = `Fetching ${untappdUser.stats?.total_checkins - dbCheckinCount} checkins...`;
      const { newCheckins } = await req.post<{
        newCheckins: UntappdCheckinData[];
      }>('checkins/fetch', { lastDbCheckin });

      const [{ totalAdded }, { user: newUser }] = await Promise.all([
        req.post<{ totalAdded: number }>('checkins/add', { newCheckins }),
        req.post<{ user: User }>('user', { untappdUser }),
      ]);

      user.set(newUser);
      await checkinStore.refresh();
      await breweryStore.refresh();

      resetButton(`Added ${totalAdded} checkins to database.`);
    } catch (error) {
      console.error('There was a problem fetching the data.', error);
      resetButton('There was a problem fetching the data.');
    }
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
            >{refreshStatus || `Last updated: ${formatDate($user.last_updated?.toString())}`}</span>
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
