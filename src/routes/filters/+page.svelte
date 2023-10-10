<script lang="ts">
  import { states } from '@utils/constants';
  let style = '';
  let state = '';

  const filter = async () => {
    console.log(style, state);
  };
</script>

<header class="padding-bottom-lg">
  <h1>Filters</h1>

  <select bind:value={style}>
    <option value="">Choose Style</option>
    <option value="IPA">IPA</option>
    <option value="Sour">Sour</option>
  </select>

  <select bind:value={state}>
    <option value="">Choose State</option>

    {#each Object.entries(states) as [code, state]}
      <option value={code}>{state}</option>
    {/each}
  </select>

  {#if style || state}
    <p>
      <button on:click={filter}>
        {#if style && state}
          Get the best {style}s from {states[state]}
        {:else if style}
          Get the best {style}s
        {:else if state}
          Get the best beers from {states[state]}
        {/if}
      </button>
    </p>
  {/if}
</header>
