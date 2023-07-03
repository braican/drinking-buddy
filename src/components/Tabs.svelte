<script lang="ts">
  export let views = [];
  let activeView = views[0] || null;
</script>

<nav class="margin-bottom-xl">
  <ul class="tabs">
    {#each views as view}
      <li>
        <button
          class:button-translucent--active={view === activeView}
          class="button button-translucent"
          aria-label={`Change to ${view} view`}
          on:click={() => (activeView = view)}>{view}</button>
      </li>
    {/each}
  </ul>
</nav>

<slot view={activeView} />

<style lang="scss">
  .tabs {
    display: flex;
    gap: var(--spacing-base);
  }
</style>
