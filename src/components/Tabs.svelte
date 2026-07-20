<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    views?: string[];
    children: Snippet<[string | null]>;
  }

  let { views = [], children }: Props = $props();
  let selectedView = $state<string | null>(null);
  let activeView = $derived(selectedView ?? views[0] ?? null);
</script>

<nav class="margin-bottom-xl">
  <ul class="tabs">
    {#each views as view (view)}
      <li>
        <button
          class:button-translucent--active={view === activeView}
          class="button button-translucent"
          aria-label={`Change to ${view} view`}
          onclick={() => (activeView = view)}>{view}</button>
      </li>
    {/each}
  </ul>
</nav>

{@render children(activeView)}

<style lang="scss">
  .tabs {
    display: flex;
    gap: var(--spacing-base);
  }
</style>
