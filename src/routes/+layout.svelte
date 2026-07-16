<script lang="ts">
  import { page } from '$app/state';
  import { Header, Nav } from '@components';
  import { userStore as user, viewStore } from '@stores';
  import '../styles/global.scss';
  import type { Snippet } from 'svelte';
  import type { User } from '@types';

  interface Props {
    data: { user?: User };
    children: Snippet;
  }

  let { data, children }: Props = $props();

  $effect(() => {
    user.set(data?.user);
  });

  $effect(() => {
    void page.url;
    viewStore.hideSearch();
  });
</script>

<div class="app">
  <Header />

  <Nav />

  <main class="padding-base">
    {@render children()}
  </main>
</div>

<style lang="scss">
  .app {
    padding-bottom: var(--spacing-xl);
  }
</style>
