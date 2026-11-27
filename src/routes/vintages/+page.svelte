<script lang="ts">
  import { resolve } from '$app/paths';
  import type { VintageFamily } from '#types';

  interface Props {
    data: { families: VintageFamily[] };
  }

  let { data }: Props = $props();
  let query = $state('');

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.families;
    return data.families.filter(f =>
      `${f.brewery.name} ${f.name} ${f.variants.map(v => v.label).join(' ')}`
        .toLowerCase()
        .includes(q),
    );
  });

  function yearRange(years: number[]): string {
    if (!years.length) return '';
    const first = years[0];
    const last = years[years.length - 1];
    return first === last ? `${first}` : `${first}–${last}`;
  }
</script>

<div>
  <header class="padding-bottom-lg">
    <h1>Vintages</h1>
    <p class="color-opacity-50 margin-top-sm">
      Beers you've had across multiple years or variants.
    </p>
  </header>

  <section class="list-section">
    <header class="list-head">
      <h2 class="list-header">{filtered.length} famil{filtered.length === 1 ? 'y' : 'ies'}</h2>
      <input type="search" placeholder="Filter" aria-label="Filter vintages" bind:value={query} />
    </header>

    {#if filtered.length}
      <ul class="margin-top-lg">
        {#each filtered as family (family.slug)}
          <li>
            <article class="family padding-base top-border">
              <div>
                <p>
                  <a class="link" href={resolve('/vintages/[slug]', { slug: family.slug })}>
                    <span class="brewery-name">{family.brewery.name}</span>
                    <span class="beer-name"><strong>{family.name}</strong></span>
                  </a>
                </p>
                <p class="margin-top-xs fs-sm color-opacity-50">
                  {[
                    family.variants.length > 1 ? `${family.variants.length} variants` : null,
                    yearRange(family.years),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <div class="text-align-right">
                <p class="fs-lg ff-mono">{family.beerCount}</p>
                <p class="margin-top-xs fs-sm nowrap">
                  {family.hads} had{family.hads === 1 ? '' : 's'}
                </p>
              </div>
            </article>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="margin-top-lg">No vintages found.</p>
    {/if}
  </section>
</div>

<style lang="scss">
  .list-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-base);

    input {
      max-width: 12rem;
    }
  }

  .family {
    display: flex;
    gap: var(--spacing-lg);
    justify-content: space-between;
  }

  .brewery-name {
    display: block;
    font-size: var(--step--1);
    opacity: 0.6;
  }

  .nowrap {
    white-space: nowrap;
  }
</style>
