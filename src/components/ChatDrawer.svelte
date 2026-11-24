<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { CloseIcon, LoadingIcon } from '#icons';
  import { renderStreamingMarkdown } from '#utils';

  type TapBeer = {
    name: string;
    bar: string | null;
    section: string | null;
    style: string | null;
    abv: number | null;
    description: string | null;
    had: { average: number | null; hads: number | null; last_had: Date | string | null } | null;
  };

  type MyBeer = {
    name: string | null;
    style: string | null;
    abv: number | null;
    average: number | null;
    hads: number | null;
    last_had: Date | string | null;
  };

  type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
  };

  interface Props {
    tapList?: TapBeer[];
    myBeers?: MyBeer[];
    open?: boolean;
    location?: string | null;
  }

  let { tapList = [], myBeers = [], open = $bindable(false), location = null }: Props = $props();

  let chatMessages: ChatMessage[] = $state([]);
  let chatInput = $state('');
  let chatLoading = $state(false);
  let chatContainer: HTMLDivElement | undefined = $state(undefined);
  let abortController: AbortController | null = null;

  const SUGGESTIONS = [
    "What's new to me that I'd love?",
    'Something hazy under 7%',
    'Best stout on right now?',
    'Something light and crisp',
  ];

  $effect(() => {
    void location;
    resetChat();
  });

  function resetChat() {
    abortController?.abort();
    abortController = null;
    chatMessages = [];
    chatInput = '';
    chatLoading = false;
  }

  function appendToReply(text: string) {
    chatMessages = [
      ...chatMessages.slice(0, -1),
      { role: 'assistant', content: chatMessages.at(-1)!.content + text },
    ];
  }

  async function sendChatMessage(text = chatInput) {
    if (!text.trim() || chatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    chatMessages = [...chatMessages, userMessage];
    chatInput = '';
    chatLoading = true;

    chatMessages = [...chatMessages, { role: 'assistant', content: '' }];

    const controller = new AbortController();
    abortController = controller;

    try {
      const response = await fetch('/api/tap-list/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages.slice(0, -1), tapList, myBeers }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error('Bad response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        appendToReply(decoder.decode(value, { stream: true }));
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }
      appendToReply(decoder.decode());
    } catch {
      // A reset (switching locations) aborts the request; the chat is already cleared.
      if (controller.signal.aborted) return;
      const partial = chatMessages.at(-1)?.content;
      chatMessages = [
        ...chatMessages.slice(0, -1),
        {
          role: 'assistant',
          content: partial
            ? `${partial}\n\n_Sorry, the connection dropped. Try again._`
            : 'Sorry, something went wrong. Try again.',
        },
      ];
    } finally {
      if (abortController === controller) {
        abortController = null;
        chatLoading = false;
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }
</script>

<svelte:window
  onkeydown={e => {
    if (e.key === 'Escape' && open) open = false;
  }} />

{#if open}
  <div
    class="backdrop"
    transition:fade={{ duration: 200 }}
    onclick={() => (open = false)}
    aria-hidden="true"
    role="presentation">
  </div>

  <div class="drawer" transition:fly={{ y: 600, duration: 320, easing: cubicOut }}>
    <div class="handle"></div>

    <div class="drawer-inner">
      <div class="drawer-top">
        <div>
          <h2 class="drawer-title">Bartender</h2>
          {#if chatMessages.length < 1}
            <p class="empty-state fs-sm color-opacity-50 margin-top-sm">
              Tell me what you're in the mood for.
            </p>
          {/if}
        </div>
        <button class="close-btn" onclick={() => (open = false)} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      {#if chatMessages.length > 0}
        <div class="chat-messages" bind:this={chatContainer}>
          {#each chatMessages as message, i (i)}
            {@const streaming = chatLoading && i === chatMessages.length - 1}
            <div class="chat-message chat-message--{message.role}">
              <p class="fs-xs fw-bold color-opacity-50 margin-bottom-xs">
                {message.role === 'user' ? 'You' : ''}
              </p>
              {#if message.role === 'assistant'}
                <div class="chat-text markdown">
                  {#if message.content}
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -- renderStreamingMarkdown sanitizes its output with DOMPurify -->
                    {@html renderStreamingMarkdown(message.content, streaming)}
                  {:else}
                    <LoadingIcon />
                  {/if}
                </div>
              {:else}
                <p class="chat-text">{message.content}</p>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="suggestions">
          {#each SUGGESTIONS as suggestion (suggestion)}
            <button
              type="button"
              class="button button-translucent fs-sm"
              onclick={() => sendChatMessage(suggestion)}>
              {suggestion}
            </button>
          {/each}
        </div>
      {/if}

      <form
        onsubmit={e => {
          e.preventDefault();
          sendChatMessage();
        }}
        class="chat-form">
        <input
          type="text"
          bind:value={chatInput}
          onkeydown={handleKeydown}
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
    </div>
  </div>
{/if}

<style lang="scss">
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  .drawer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 101;
    background: var(--color-black-90);
    border-radius: 20px 20px 0 0;
    max-height: 68vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -8px 48px rgba(0, 0, 0, 0.7);
  }

  .handle {
    width: 36px;
    height: 4px;
    background: var(--color-white-25);
    border-radius: 2px;
    margin: 12px auto 0;
    flex-shrink: 0;
  }

  .drawer-inner {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .drawer-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-base);
    flex-shrink: 0;
    padding: var(--spacing-sm) var(--spacing-base);
  }

  .drawer-title {
    font-size: var(--step-1);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    opacity: 0.5;

    :global(svg) {
      width: 16px;
      display: block;
    }

    &:hover {
      opacity: 1;
    }
  }

  .empty-state {
    flex: 1;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    border-top: 1px solid var(--color-white-8);
    padding: var(--spacing-base) var(--spacing-base) var(--spacing-lg);
    font-size: var(--step--1);
  }

  .chat-message {
    border-radius: var(--border-radius);

    + .chat-message {
      margin-top: var(--spacing-base);
    }

    &--user {
      background: var(--color-white-8);
      padding: var(--spacing-base);
    }
    &--assistant {
      padding-left: var(--spacing-sm);
      padding-right: var(--spacing-sm);
    }
  }

  .suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    padding: 0 var(--spacing-base) var(--spacing-sm);
  }

  .chat-form {
    display: flex;
    gap: var(--spacing-sm);
    flex-shrink: 0;
    padding: var(--spacing-base);
    background: var(--color-black);
  }

  .chat-input {
    flex: 1;
    border-radius: var(--border-radius);
    background: var(--color-black);
  }

  .chat-input::placeholder {
    color: var(--color-white-15);
  }
</style>
