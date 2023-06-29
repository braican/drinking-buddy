<script lang="ts">
  import { Header, Nav } from '@components';
  import { userStore as user } from '@stores';
  import '../styles/global.scss';

  export let data;

  $: user.set(data?.user);
</script>

<Header />

<Nav />

<main class="padding-base">
  <slot />
</main>
