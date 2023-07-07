<script>
  import { viewStore } from '@stores';
  import { Search } from '@components';
  import { HomeIcon, SearchIcon } from '@icons';

  const { searchVisible } = viewStore;
</script>

<nav class="nav">
  <a class="nav-button" href="/" aria-label="Home">
    <HomeIcon />
  </a>
  <button class="nav-button" aria-label="Search" on:click={viewStore.showSearch}>
    <SearchIcon />
  </button>
</nav>

{#if $searchVisible}
  <Search />
{/if}

<style lang="scss">
  .nav {
    position: fixed;
    gap: var(--spacing-sm);
    bottom: var(--spacing-base);
    right: var(--spacing-base);
    display: flex;
  }

  .nav-button {
    height: 44px;
    width: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-primary);

    :global(svg) {
      width: 50%;
      display: block;
    }
  }
</style>
