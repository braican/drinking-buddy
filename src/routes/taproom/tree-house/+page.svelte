<script lang="ts">
  import type { Beer } from '../../../../types/beer';

  export let data: { brewery: { name: string }; beers: Beer[] };

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

  type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
  };

  const LOCATIONS = [
    { key: 'charlton', name: 'Charlton' },
    { key: 'tewksbury', name: 'Tewksbury' },
    { key: 'prudential', name: 'Prudential Center (Boston)' },
    { key: 'sandwich', name: 'Sandwich (Cape Cod)' },
    { key: 'deerfield', name: 'Deerfield' },
    { key: 'saratoga', name: 'Saratoga' },
    { key: 'woodstock', name: 'Woodstock (CT)' },
  ];

  const CACHE_KEY = (loc: string) => `taplist:${loc}`;

  let selectedLocation: string | null = null;
  let tapList: TapBeer[] = [];
  let tapListLoading = false;
  let tapListError: string | null = null;
  let fetchedAt: number | null = null;

  let expandedDescriptions = new Set<string>();

  let chatMessages: ChatMessage[] = [];
  let chatInput = '';
  let chatLoading = false;
  let chatContainer: HTMLDivElement;

  $: crossReferenced = tapList.map(tapBeer => ({
    ...tapBeer,
    myBeer: findMyBeer(tapBeer.name),
  }));

  $: beersByBar = groupByBar(crossReferenced);

  $: triedCount = crossReferenced.filter(b => b.myBeer).length;
  $: newCount = crossReferenced.filter(b => !b.myBeer).length;

  $: fetchedAtLabel = fetchedAt ? timeAgo(fetchedAt) : null;

  function readCache(locationKey: string): CacheEntry | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY(locationKey));
      if (!raw) return null;
      return JSON.parse(raw) as CacheEntry;
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
    const barMap = new Map<string, Map<string, CrossReferencedBeer[]>>();

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
    chatMessages = [];

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

  async function sendChatMessage() {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput.trim() };
    chatMessages = [...chatMessages, userMessage];
    chatInput = '';
    chatLoading = true;

    try {
      const response = await fetch('/api/tap-list/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          tapList,
          myBeers: data.beers.map(b => ({
            name: b.name,
            style: b.style,
            abv: b.abv,
            average: b.average,
            hads: b.hads,
            last_had: b.last_had,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        chatMessages = [...chatMessages, { role: 'assistant', content: result.data.reply }];
        setTimeout(() => {
          if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 0);
      }
    } catch {
      chatMessages = [
        ...chatMessages,
        { role: 'assistant', content: 'Sorry, something went wrong. Try again.' },
      ];
    } finally {
      chatLoading = false;
    }
  }

  function firstSentence(text: string): string {
    const match = text.match(/^.*?[.!?](?:\s|$)/);
    return match ? match[0].trim() : text;
  }

  function toggleDescription(name: string) {
    if (expandedDescriptions.has(name)) {
      expandedDescriptions.delete(name);
    } else {
      expandedDescriptions.add(name);
    }
    expandedDescriptions = expandedDescriptions;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }
</script>

<div>
  <header class="padding-bottom-lg">
    <p class="color-opacity-50 margin-bottom-sm">
      <a class="link" href="/brewery/tree-house-brewing-company">{data.brewery.name}</a>
    </p>
    <h1>Tap List</h1>
  </header>

  <section class="margin-bottom-xl">
    <p class="fs-sm fw-bold tt-uppercase color-opacity-50 margin-bottom-md">Select a location</p>
    <div class="locations">
      {#each LOCATIONS as location}
        <button
          class="button button-translucent"
          class:button-translucent--active={selectedLocation === location.key}
          on:click={() => fetchTapList(location.key)}
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
          {tapList.length} beers on tap &mdash; {newCount} new to you, {triedCount} you've had
        </p>
        <p class="fs-sm color-opacity-50 meta-refresh">
          {#if fetchedAtLabel}fetched {fetchedAtLabel}{/if}
          <button
            class="button-refresh"
            on:click={() => fetchTapList(selectedLocation, true)}
            disabled={tapListLoading}>
            Refresh
          </button>
        </p>
      </div>

      {#each beersByBar as [bar, styleGroups]}
        <div class="bar-group margin-bottom-xl">
          <h2 class="bar-heading margin-bottom-lg">{bar}</h2>
          {#each styleGroups as [style, beers]}
            <div class="style-group margin-bottom-lg">
              <h3 class="style-heading fs-xs tt-uppercase margin-bottom-sm">{style}</h3>
              {#each beers as beer}
                <article class="tap-beer padding-base top-border">
                  <div class="tap-beer-info">
                    <p class="fw-bold">
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
                      {@const expanded = expandedDescriptions.has(beer.name)}
                      <p class="fs-sm margin-top-xs description">
                        {expanded ? beer.description : teaser}
                        {#if hasMore}
                          <button class="desc-toggle" on:click={() => toggleDescription(beer.name)}>
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

    <section class="chat-section">
      <header class="margin-bottom-lg">
        <h2>Get Recommendations</h2>
        <p class="fs-sm color-opacity-50 margin-top-sm">
          Ask for a recommendation based on your taste profile.
        </p>
      </header>

      {#if chatMessages.length > 0}
        <div class="chat-messages margin-bottom-lg" bind:this={chatContainer}>
          {#each chatMessages as message}
            <div class="chat-message chat-message--{message.role} padding-base">
              <p class="fs-xs fw-bold color-opacity-50 margin-bottom-xs">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </p>
              <p class="chat-text">{message.content}</p>
            </div>
          {/each}
          {#if chatLoading}
            <div class="chat-message chat-message--assistant padding-base">
              <p class="color-opacity-50">...</p>
            </div>
          {/if}
        </div>
      {/if}

      <form on:submit|preventDefault={sendChatMessage} class="chat-form">
        <input
          type="text"
          bind:value={chatInput}
          on:keydown={handleKeydown}
          placeholder="What should I drink?"
          disabled={chatLoading}
          class="chat-input" />
        <button
          type="submit"
          class="button button-orange"
          disabled={chatLoading || !chatInput.trim()}>
          Send
        </button>
      </form>
    </section>
  {:else if selectedLocation && !tapListLoading}
    <p class="color-opacity-50">No beers found for this location.</p>
  {/if}
</div>

<style lang="scss">
  .locations {
    display: flex;
    overflow: auto;
    gap: var(--spacing-sm);

    > button {
      white-space: nowrap;
    }
  }

  .bar-heading {
    font-size: var(--step-1);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-white-25);
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
    justify-content: space-between;
    align-items: flex-start;
  }

  .tap-beer-info {
    flex: 1;
    min-width: 0;
  }

  .tap-beer-history {
    flex-shrink: 0;
  }

  .status-badge {
    display: inline-block;
    margin-right: 0.25em;
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

  .chat-section {
    border-top: 1px solid var(--color-white-15);
    padding-top: var(--spacing-xl);
  }

  .chat-messages {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-height: 400px;
    overflow-y: auto;
  }

  .chat-message {
    border-radius: var(--border-radius);

    &--user {
      background: var(--color-white-8);
    }

    &--assistant {
      background: var(--color-white-15);
    }
  }

  .chat-text {
    white-space: pre-wrap;
  }

  .chat-form {
    display: flex;
    gap: var(--spacing-sm);
  }

  .chat-input {
    flex: 1;
    border-radius: var(--border-radius);
  }

  .chat-input::placeholder {
    color: var(--color-white-15);
  }
</style>
