<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { CloseIcon, LoadingIcon } from '@icons';
  import { renderStreamingMarkdown } from '@utils';

  type TapBeer = {
    name: string;
    bar: string | null;
    style: string | null;
    abv: number | null;
    description: string | null;
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

  $effect(() => {
    location;
    resetChat();
  });

  function resetChat() {
    chatMessages = [];
    chatInput = '';
    chatLoading = false;
  }

  async function sendChatMessage() {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput.trim() };
    chatMessages = [...chatMessages, userMessage];
    chatInput = '';
    chatLoading = true;

    chatMessages = [...chatMessages, { role: 'assistant', content: '' }];

    try {
      const response = await fetch('/api/tap-list/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages.slice(0, -1), tapList, myBeers }),
      });

      if (!response.ok || !response.body) throw new Error('Bad response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        chatMessages = [
          ...chatMessages.slice(0, -1),
          { role: 'assistant', content: chatMessages.at(-1)!.content + chunk },
        ];

        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    } catch {
      chatMessages = [
        ...chatMessages.slice(0, -1),
        { role: 'assistant', content: 'Sorry, something went wrong. Try again.' },
      ];
    } finally {
      chatLoading = false;
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
              Ask me anything about what's on tap...
            </p>
          {/if}
        </div>
        <button class="close-btn" onclick={() => (open = false)} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      {#if chatMessages.length > 0}
        <div class="chat-messages" bind:this={chatContainer}>
          {#each chatMessages as message}
            <div class="chat-message chat-message--{message.role}">
              <p class="fs-xs fw-bold color-opacity-50 margin-bottom-xs">
                {message.role === 'user' ? 'You' : ''}
              </p>
              {#if message.role === 'assistant'}
                <div class="chat-text markdown">
                  {#if message.content}
                    {@html renderStreamingMarkdown(message.content)}
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
