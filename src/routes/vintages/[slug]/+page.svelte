<script lang="ts">
  import { pageTitle } from '#utils';
  import { resolve } from '$app/paths';
  import { CheckinList } from '#components';
  import type { PaginatedCheckins, VintageEntry, VintageFamily } from '#types';

  interface Props {
    data: { family: VintageFamily; streamed: { checkins: Promise<PaginatedCheckins> } };
  }

  let { data }: Props = $props();

  const family = $derived(data.family);

  // Every year from the newest back to the oldest, so gaps show up as empty columns.
  const columns = $derived.by(() => {
    const years = family.years;
    const cols: (number | null)[] = [];
    if (years.length) {
      for (let y = years[years.length - 1]; y >= years[0]; y--) cols.push(y);
    }
    if (family.variants.some(v => v.entries.some(e => e.year === null))) cols.push(null);
    return cols;
  });

  const yearsHad = $derived(family.years.length);
  const yearSpan = $derived(
    family.years.length ? family.years[family.years.length - 1] - family.years[0] + 1 : 0,
  );

  function entriesFor(entries: VintageEntry[], year: number | null): VintageEntry[] {
    return entries.filter(e => e.year === year);
  }

  function cellTitle(entry: VintageEntry): string {
    const rating = entry.average ? ` · ${entry.average.toFixed(2)}` : '';
    return `${entry.name} · ${entry.hads} had${entry.hads === 1 ? '' : 's'}${rating}`;
  }
</script>

<svelte:head>
  <title>{pageTitle(`${family.name} Vintages`, family.brewery.name)}</title>
</svelte:head>

<div>
  <header class="padding-bottom-lg">
    <p class="color-opacity-50 margin-bottom-sm">
      <a class="link" href={resolve('/vintages')}>&larr; Vintages</a>
    </p>
    <p class="color-opacity-50">
      <a class="link" href={resolve('/brewery/[slug]', { slug: family.brewery.slug })}
        >{family.brewery.name}</a>
    </p>
    <h1>{family.name}</h1>
    <p class="fs-sm color-opacity-50 margin-top-sm">
      {family.beerCount} beer{family.beerCount === 1 ? '' : 's'}
      {#if family.variants.length > 1}· {family.variants.length} variants{/if}
      · {family.hads} had{family.hads === 1 ? '' : 's'}
    </p>
    {#if yearSpan > 1}
      <p class="fs-sm color-opacity-50">
        {yearsHad} of {yearSpan} years, {family.years[0]}–{family.years[family.years.length - 1]}
      </p>
    {/if}
  </header>

  <section class="list-section margin-bottom-xl">
    <h2 class="list-header">Vintage tree</h2>

    <div class="grid-scroll margin-top-lg">
      <table class="grid">
        <thead>
          <tr>
            <th scope="col" class="variant-col" aria-label="Variant"></th>
            {#each columns as year (year ?? 'nv')}
              <th scope="col" class="year fs-xs ff-mono">{year ?? 'NV'}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each family.variants as variant (variant.label)}
            <tr>
              <th scope="row" class="variant-col fs-sm">{variant.label}</th>
              {#each columns as year (year ?? 'nv')}
                {@const entries = entriesFor(variant.entries, year)}
                <td class:had={entries.length > 0}>
                  {#each entries as entry (entry.id)}
                    <a
                      class="cell ff-mono fs-xs"
                      href={resolve('/beer/[slug]', { slug: entry.slug })}
                      title={cellTitle(entry)}>
                      {entry.average ? entry.average.toFixed(2) : '✓'}
                    </a>
                  {:else}
                    <span class="empty" aria-hidden="true"></span>
                  {/each}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="fs-xs color-opacity-50 margin-top-sm">
      Filled cells are vintages you've had, showing your average rating. Tap one to see the beer.
    </p>
  </section>

  <section class="list-section">
    {#await data.streamed.checkins}
      <p>Loading</p>
    {:then paginatedCheckins}
      {#if paginatedCheckins?.checkins.length}
        <CheckinList checkinData={paginatedCheckins} vintageSlug={family.slug} />
      {:else}
        <p class="margin-top-lg">No checkins</p>
      {/if}
    {/await}
  </section>
</div>

<style lang="scss">
  .grid-scroll {
    overflow-x: auto;
    margin-left: calc(var(--spacing-base) * -1);
    margin-right: calc(var(--spacing-base) * -1);
    padding-left: var(--spacing-base);
    padding-right: var(--spacing-base);
  }

  .grid {
    border-collapse: separate;
    border-spacing: 3px;

    th,
    td {
      text-align: center;
      vertical-align: middle;
    }
  }

  .variant-col {
    position: sticky;
    left: 0;
    z-index: 1;
    background-color: var(--color-black);
    text-align: left !important;
    font-weight: normal;
    min-width: 8rem;
    max-width: 11rem;
    padding-right: var(--spacing-sm);
    line-height: 1.2;
  }

  .year {
    opacity: 0.5;
    font-weight: normal;
    padding-bottom: var(--spacing-xs);
  }

  td {
    min-width: 2.75rem;
    height: 2.25rem;
    border-radius: var(--border-radius);
    background-color: var(--color-white-8);

    &.had {
      background-color: color-mix(in srgb, var(--color-primary) 22%, transparent);
    }
  }

  .cell {
    display: block;
    padding: var(--spacing-xs);
    color: var(--color-white);

    & + & {
      border-top: 1px solid var(--color-white-15);
    }

    &:hover {
      color: var(--color-primary);
    }
  }

  .empty {
    display: block;
  }
</style>
