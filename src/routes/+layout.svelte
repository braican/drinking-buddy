<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { Header, Nav } from '@components';
  import type { User } from '@models';
  import '../styles/global.scss';

  export let data;

  const user: Writable<User> = writable();
  $: user.set(data?.user);
  setContext('user', user);
</script>

<Header />

<Nav />

<slot />
