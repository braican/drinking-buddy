<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { Header, Nav } from '@components';
  import '../styles/global.scss';

  export let data;

  const user = writable();
  $: user.set(data?.user);
  setContext('user', user);
</script>

<Header />

<Nav />

<slot />
