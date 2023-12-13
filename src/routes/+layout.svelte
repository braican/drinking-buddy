<script lang="ts">
  import { onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { Header, Nav } from '@components';
  import { userStore as user, viewStore } from '@stores';
  import '../styles/global.scss';

  export let data;

  $: user.set(data?.user);

  // Check if the code is running on the client side (frontend)
  if (!import.meta.env.SSR) {
    const unsubscribePage = page.subscribe(value => {
      viewStore.hideSearch();
    });
    onDestroy(unsubscribePage);
  }
</script>

<div class="app">
  <Header />

  <Nav />

  <main class="padding-base">
    <slot />
  </main>
</div>

<style lang="scss">
  .app {
    padding-bottom: var(--spacing-xl);
  }
</style>
