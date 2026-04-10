<script>
  import { page } from '$app/stores';
  import { viewStore } from '@stores';
  import { Search } from '@components';
  import { SearchIcon } from '@icons';

  const { searchVisible } = viewStore;

  const isTreeHousePage = $derived($page.url.pathname === '/taproom/tree-house');
</script>

{#if !isTreeHousePage}
  <nav class="nav">
    <button class="nav-button" aria-label="Search" onclick={viewStore.showSearch}>
      <SearchIcon />
    </button>
  </nav>
{/if}

{#if $searchVisible}
  <Search />
{/if}

<style lang="scss">
  .nav {
    position: fixed;
    bottom: var(--spacing-base);
    right: var(--spacing-base);
    z-index: 99;
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

    &:hover {
      background-color: var(--color-primary-hover);
    }
  }
</style>
