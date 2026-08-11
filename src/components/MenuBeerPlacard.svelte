<script lang="ts">
  // One line of a menu or tap list, cross-referenced against your drinking history:
  // a checkmark and your rating when you've had it, a "New" badge when you haven't.
  //
  // Everything page-specific goes in the `details` and `badges` snippets, so the
  // scan-menu list and the taproom tap list share a layout without either having to
  // carry the other's fields.
  import { resolve } from '$app/paths';
  import type { Snippet } from 'svelte';
  import type { Beer, BeerWithData } from '@types';

  interface Props {
    /** The name as printed on the menu, which may differ from the canonical one. */
    name: string;
    /** Your history record, or null when this is new to you. */
    beer?: Beer | BeerWithData | null;
    /** Lines under the name — brewery, ABV, description. */
    details?: Snippet;
    /** Inline badges after the name — sold out, low confidence. */
    badges?: Snippet;
  }

  let { name, beer = null, details, badges }: Props = $props();
</script>

<article class="menu-beer top-border">
  <div class="menu-beer-info">
    <p class="menu-beer-name fw-bold">
      <span class="status-badge" title={beer ? "You've had this" : 'New to you'}>
        {beer ? '✓' : '★'}
      </span>
      {#if beer?.slug}
        <a class="link" href={resolve('/beer/[slug]', { slug: beer.slug })}>{name}</a>
      {:else}
        <span>{name}</span>
      {/if}
      {#if badges}
        {@render badges()}
      {/if}
    </p>

    {#if details}
      {@render details()}
    {/if}
  </div>

  <div class="menu-beer-history text-align-right">
    {#if beer}
      <p class="ff-mono fs-lg">{beer.average != null ? beer.average.toFixed(2) : '—'}</p>
      <p class="fs-sm color-opacity-50 margin-top-xs">
        {beer.hads}
        {beer.hads === 1 ? 'had' : 'hads'}
      </p>
    {:else}
      <p class="fs-sm new-badge">New</p>
    {/if}
  </div>
</article>

<style lang="scss">
  .menu-beer {
    display: flex;
    gap: var(--spacing-lg);
    padding: var(--spacing-base) var(--spacing-sm);
    justify-content: space-between;
    align-items: flex-start;
  }

  .menu-beer-info {
    flex: 1;
    min-width: 0;
  }

  .menu-beer-name {
    display: flex;
    gap: 0.6em;
    flex-wrap: wrap;
    align-items: baseline;
  }

  .menu-beer-history {
    flex-shrink: 0;
  }

  .status-badge {
    color: var(--color-primary);
  }

  .new-badge {
    color: var(--color-accent);
    font-weight: var(--fw-bold);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
