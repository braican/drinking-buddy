<script lang="ts">
  import { Header, Nav } from '@components';
  import { userStore as user } from '@stores';
  import '../styles/global.scss';

  export let data;

  $: user.set(data?.user);
</script>

<div class="app">
  <Header />

  <Nav />

  <!-- <main class="padding-base">
    <slot />
  </main> -->
</div>

<style lang="scss">
  .app {
    padding-bottom: var(--spacing-xl);
  }
</style>
