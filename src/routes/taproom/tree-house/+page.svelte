<script lang="ts">
  import { resolve } from '$app/paths';
  import { SvelteMap } from 'svelte/reactivity';
  import type { Beer } from '@types';
  import { ChatDrawer } from '@components';

  interface Props {
    data: { brewery: { name: string }; beers: Beer[] };
  }

  let { data }: Props = $props();

  type TapBeer = {
    name: string;
    bar: string | null;
    style: string | null;
    abv: number | null;
    description: string | null;
  };

  type CacheEntry = {
    beers: TapBeer[];
    fetchedAt: number;
  };

  type CrossReferencedBeer = TapBeer & {
    myBeer: Beer | null;
  };

  const LOCATIONS = [
    { key: 'charlton', name: 'Charlton' },
    // { key: 'tewksbury', name: 'Tewksbury' }, // need another way to get this taplist.
    { key: 'prudential', name: 'Prudential Center (Boston)' },
    { key: 'sandwich', name: 'Sandwich (Cape Cod)' },
    { key: 'deerfield', name: 'Deerfield' },
    // { key: 'saratoga', name: 'Saratoga' }, // need another way to get this taplist.
    { key: 'woodstock', name: 'Woodstock (CT)' },
  ];

  const CACHE_KEY = (loc: string) => `taplist:${loc}`;

  let selectedLocation: string | null = $state(null);
  let tapList: TapBeer[] = $state([]);
  let tapListLoading = $state(false);
  let tapListError: string | null = $state(null);
  let fetchedAt: number | null = $state(null);

  let expandedDescriptions = $state<Record<string, boolean>>({});

  let chatOpen = $state(false);

  const crossReferenced = $derived(
    tapList.map(tapBeer => ({
      ...tapBeer,
      myBeer: findMyBeer(tapBeer.name),
    })),
  );

  const beersByBar = $derived(groupByBar(crossReferenced));

  const triedCount = $derived(crossReferenced.filter(b => b.myBeer).length);
  const newCount = $derived(crossReferenced.filter(b => !b.myBeer).length);

  const fetchedAtLabel = $derived(fetchedAt ? timeAgo(fetchedAt) : null);

  const chatBeers = $derived(
    data.beers.map(b => ({
      name: b.name,
      style: b.style,
      abv: b.abv,
      average: b.average,
      hads: b.hads,
      last_had: b.last_had,
    })),
  );

  function readCache(locationKey: string): CacheEntry | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY(locationKey));
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry;
      const cachedDate = new Date(entry.fetchedAt).toDateString();
      const today = new Date().toDateString();
      if (cachedDate !== today) {
        localStorage.removeItem(CACHE_KEY(locationKey));
        return null;
      }
      return entry;
    } catch {
      return null;
    }
  }

  function writeCache(locationKey: string, beers: TapBeer[]) {
    try {
      const entry: CacheEntry = { beers, fetchedAt: Date.now() };
      localStorage.setItem(CACHE_KEY(locationKey), JSON.stringify(entry));
    } catch {
      // localStorage unavailable — silently ignore
    }
  }

  function timeAgo(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) {
      const m = Math.floor(diff / 60);
      return `${m}m ago`;
    }
    const h = Math.floor(diff / 3600);
    return `${h}h ago`;
  }

  function findMyBeer(name: string): Beer | null {
    const normalized = name.toLowerCase().trim();
    return data.beers.find(b => b.name?.toLowerCase().trim() === normalized) ?? null;
  }

  function groupByBar(beers: CrossReferencedBeer[]): [string, [string, CrossReferencedBeer[]][]][] {
    const barMap = new SvelteMap<string, Map<string, CrossReferencedBeer[]>>();

    for (const beer of beers) {
      const bar = beer.bar || 'Drafts';
      const style = beer.style || 'Other';
      if (!barMap.has(bar)) barMap.set(bar, new Map());
      const styleMap = barMap.get(bar)!;
      if (!styleMap.has(style)) styleMap.set(style, []);
      styleMap.get(style)!.push(beer);
    }

    for (const styleMap of barMap.values()) {
      for (const group of styleMap.values()) {
        group.sort((a, b) => {
          if (a.myBeer && !b.myBeer) return 1;
          if (!a.myBeer && b.myBeer) return -1;
          return 0;
        });
      }
    }

    return [...barMap.entries()].map(([bar, styleMap]) => [bar, [...styleMap.entries()]]);
  }

  async function fetchTapList(locationKey: string, force = false) {
    if (tapListLoading) return;

    selectedLocation = locationKey;
    tapListError = null;
    chatOpen = false;
    expandedDescriptions = {};

    if (!force) {
      const cached = readCache(locationKey);
      if (cached) {
        tapList = cached.beers;
        fetchedAt = cached.fetchedAt;
        return;
      }
    }

    tapList = [];
    fetchedAt = null;
    tapListLoading = true;

    try {
      const response = await fetch(`/api/tap-list?location=${locationKey}`);
      const result = await response.json();

      if (result.success) {
        tapList = result.data.beers;
        fetchedAt = Date.now();
        writeCache(locationKey, tapList);
      } else {
        tapListError = result.message || 'Failed to fetch the tap list.';
      }
    } catch {
      tapListError = 'Something went wrong fetching the tap list.';
    } finally {
      tapListLoading = false;
    }
  }

  function firstSentence(text: string): string {
    const match = text.match(/^.*?[.!?](?:\s|$)/);
    return match ? match[0].trim() : text;
  }

  function toggleDescription(name: string) {
    expandedDescriptions[name] = !expandedDescriptions[name];
  }
</script>

<div>
  <header class="padding-bottom-lg">
    <p class="color-opacity-50 margin-bottom-sm">
      <a class="link" href={resolve('/brewery/[slug]', { slug: 'tree-house-brewing-company' })}
        >{data.brewery.name}</a>
    </p>
    <h1>Tap List</h1>
  </header>

  <section class="margin-bottom-xl">
    <p class="fs-sm fw-bold tt-uppercase color-opacity-50 margin-bottom-md">Select a location</p>
    <div class="locations">
      {#each LOCATIONS as location (location.key)}
        <button
          class="button button-translucent"
          class:button-translucent--active={selectedLocation === location.key}
          onclick={() => fetchTapList(location.key)}
          disabled={tapListLoading}>
          {location.name}
        </button>
      {/each}
    </div>
  </section>

  {#if tapListLoading}
    <p class="color-opacity-50">Fetching the draft list — this may take a moment...</p>
  {:else if tapListError}
    <p class="color-accent">{tapListError}</p>
  {:else if tapList.length > 0}
    <section class="margin-bottom-xl">
      <div class="tap-list-meta margin-bottom-lg">
        <p class="fs-sm color-opacity-50">
          {tapList.length} beers on tap
          <br />{newCount} new to you, {triedCount} you've had
        </p>
        <p class="fs-sm color-opacity-50 meta-refresh">
          {#if fetchedAtLabel}fetched {fetchedAtLabel}{/if}
          <button
            class="button-refresh"
            onclick={() => fetchTapList(selectedLocation, true)}
            disabled={tapListLoading}>
            Refresh
          </button>
        </p>
      </div>

      {#each beersByBar as [bar, styleGroups] (bar)}
        <div class="bar-group margin-bottom-xl">
          <h2 class="bar-heading margin-bottom-lg">{bar}</h2>
          {#each styleGroups as [style, beers] (style)}
            <div class="style-group margin-bottom-lg">
              <h3 class="style-heading fs-xs tt-uppercase margin-bottom-sm">{style}</h3>
              {#each beers as beer (beer.name)}
                <article class="tap-beer top-border">
                  <div class="tap-beer-info">
                    <p class="fw-bold tap-beer-name">
                      <span
                        class="status-badge"
                        title={beer.myBeer ? "You've had this" : 'New to you'}>
                        {beer.myBeer ? '✓' : '★'}
                      </span>
                      {beer.name}
                    </p>
                    {#if beer.abv != null}
                      <p class="fs-sm color-opacity-50 margin-top-xs">{beer.abv}% ABV</p>
                    {/if}
                    {#if beer.description}
                      {@const teaser = firstSentence(beer.description)}
                      {@const hasMore = teaser.length < beer.description.length}
                      {@const expanded = !!expandedDescriptions[beer.name]}
                      <p class="fs-sm margin-top-xs description">
                        {expanded ? beer.description : teaser}
                        {#if hasMore}
                          <button class="desc-toggle" onclick={() => toggleDescription(beer.name)}>
                            {expanded ? 'Less' : 'More'}
                          </button>
                        {/if}
                      </p>
                    {/if}
                  </div>
                  {#if beer.myBeer}
                    <div class="tap-beer-history text-align-right">
                      <p class="ff-mono fs-lg">
                        {beer.myBeer.average != null ? beer.myBeer.average.toFixed(2) : '—'}
                      </p>
                      <p class="fs-sm color-opacity-50 margin-top-xs">
                        {beer.myBeer.hads}
                        {beer.myBeer.hads === 1 ? 'had' : 'hads'}
                      </p>
                    </div>
                  {:else}
                    <div class="tap-beer-history text-align-right">
                      <p class="fs-sm new-badge">New</p>
                    </div>
                  {/if}
                </article>
              {/each}
            </div>
          {/each}
        </div>
      {/each}
    </section>
  {:else if selectedLocation && !tapListLoading}
    <p class="color-opacity-50">No beers found for this location.</p>
  {/if}
</div>

{#if tapList.length > 0}
  <button class="chat-fab" aria-label="Ask for a recommendation" onclick={() => (chatOpen = true)}>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
    </svg>
  </button>
{/if}

<ChatDrawer bind:open={chatOpen} {tapList} myBeers={chatBeers} location={selectedLocation} />

<style lang="scss">
  .locations {
    display: flex;
    overflow: auto;
    gap: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    margin-left: calc(var(--spacing-base) * -1);
    margin-right: calc(var(--spacing-base) * -1);
    padding-left: var(--spacing-base);
    padding-right: var(--spacing-base);

    > button {
      white-space: nowrap;
    }
  }

  .bar-heading {
    font-size: var(--step-1);
    padding-bottom: var(--spacing-sm);
    text-transform: uppercase;
  }

  .tap-list-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--spacing-base);
  }

  .meta-refresh {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);
    white-space: nowrap;
  }

  .button-refresh {
    font-size: var(--step--2);
    opacity: 0.5;
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      opacity: 1;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.3;
    }
  }

  .style-heading {
    opacity: 0.4;
    border-bottom: 1px solid var(--color-white-15);
    padding-bottom: var(--spacing-xs);
  }

  .tap-beer {
    display: flex;
    gap: var(--spacing-lg);
    padding: var(--spacing-base) var(--spacing-sm);
    justify-content: space-between;
    align-items: flex-start;
  }

  .tap-beer-info {
    flex: 1;
    min-width: 0;
  }

  .tap-beer-name {
    display: flex;
    gap: 0.6em;
  }

  .tap-beer-history {
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

  .description {
    opacity: 0.6;
    max-width: 60ch;
  }

  .desc-toggle {
    margin-left: 0.25em;
    font-size: inherit;
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }

  .chat-fab {
    position: fixed;
    bottom: var(--spacing-base);
    right: var(--spacing-base);
    z-index: 99;
    height: 44px;
    width: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-primary);

    svg {
      width: 52%;
      display: block;
    }

    &:hover {
      background-color: var(--color-primary-hover);
    }
  }
</style>
