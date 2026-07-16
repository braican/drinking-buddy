<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import {
    RefreshIcon,
    CloseIcon,
    MenuIcon,
    HomeIcon,
    FiltersIcon,
    BuildingIcon,
    CameraIcon,
  } from '@icons';
  import { ApiRequest, formatDate } from '@utils';
  import { userStore as user } from '@stores';
  import type { UntappdUser, UntappdCheckinData, User } from '@types';

  let menuOpen = $state(false);
  let isRefreshing = $state(false);
  let refreshButtonText = $state('Refresh');
  let refreshStatus = $state('');

  $effect(() => {
    void $page;
    menuOpen = false;
  });

  const NAV_LINKS = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/filters', label: 'Filters', icon: FiltersIcon },
    { href: '/scan-menu', label: 'Scan Menu', icon: CameraIcon },
    { href: '/taproom/tree-house', label: 'Tree House Tap List', icon: BuildingIcon },
  ] as const;

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
      await Promise.all([
        fetch('/api/checkins/latest', { cache: 'reload' }),
        fetch('/api/stats', { cache: 'reload' }),
        fetch('/api/stats?timeframe=recent', { cache: 'reload' }),
      ]);
      await invalidateAll();

      resetButton(`Added ${totalAdded} checkins to database.`);
    } catch (error) {
      console.error('There was a problem fetching the data.', error);
      resetButton('There was a problem fetching the data.');
    }
  };
</script>

<header class="header padding-base">
  {#if $user}
    <button class="menu-button" onclick={() => (menuOpen = true)} aria-label="Open menu">
      <MenuIcon />
    </button>

    <figure class="user-photo">
      <a href={resolve('/', {})}><img src={$user.avatar} alt="Nick Braica's Untappd profile." /></a>
    </figure>

    <div class="stats">
      <p class="fs-sm">Checkins: <strong>{$user.checkins?.toLocaleString()}</strong></p>
      <p class="fs-sm">Beers: <strong>{$user.beers?.toLocaleString()}</strong></p>

      <button
        aria-label="Refresh checkins"
        onclick={refresh}
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

{#if menuOpen}
  <div
    class="menu-overlay"
    onclick={() => (menuOpen = false)}
    onkeydown={e => e.key === 'Escape' && (menuOpen = false)}
    role="presentation"
    transition:fade={{ duration: 200 }}>
  </div>

  <nav class="menu-panel" transition:fly={{ x: -320, duration: 250, opacity: 1 }}>
    <div class="panel-header">
      <button class="menu-close" onclick={() => (menuOpen = false)} aria-label="Close menu">
        <CloseIcon />
      </button>
      <figure class="user-photo">
        <a href={resolve('/', {})}
          ><img src={$user.avatar} alt="Nick Braica's Untappd profile." /></a>
      </figure>
    </div>

    <ul class="menu-links">
      {#each NAV_LINKS as link (link.href)}
        {@const Icon = link.icon}
        <li>
          <a
            href={resolve(link.href, {})}
            class="menu-link"
            class:menu-link--active={$page.url.pathname === link.href}>
            <span class="menu-link-icon"><Icon /></span>
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style lang="scss">
  .header {
    border-top: 2px solid var(--color-primary);
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: var(--spacing-base);
  }

  .menu-button {
    width: 44px;
    height: 44px;
    padding: 8px;
    margin-left: -8px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-white);
    opacity: 0.6;
    margin-top: 12px;

    :global(svg) {
      display: block;
      width: 100%;
    }

    &:hover {
      opacity: 1;
    }
  }

  .user-photo {
    width: 60px;
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
    }
  }

  .stats {
    text-align: right;
    flex: 1;
    margin-left: auto;
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

  /* Slideout menu */

  .menu-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 199;
  }

  .menu-panel {
    position: fixed;
    border-top: 2px solid var(--color-primary);
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: var(--color-black);
    border-right: 1px solid var(--color-white-15);
    z-index: 200;
    display: flex;
    flex-direction: column;
    padding: var(--spacing-lg) var(--spacing-base);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
  }

  .menu-close {
    width: 44px;
    height: 44px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;

    :global(svg) {
      display: block;
      width: 100%;
    }

    &:hover {
      opacity: 1;
    }
  }

  .menu-links {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .menu-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-sm);
    border-radius: var(--border-radius);
    font-size: var(--step-0);
    opacity: 0.7;
    transition:
      opacity 0.15s,
      background 0.15s;

    &:hover {
      opacity: 1;
      background: var(--color-white-8);
    }

    &--active {
      opacity: 1;
      color: var(--color-primary);
    }
  }

  .menu-link-icon {
    width: 20px;
    flex-shrink: 0;

    :global(svg) {
      display: block;
      width: 100%;
    }
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
