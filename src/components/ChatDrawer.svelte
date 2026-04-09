<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { CloseIcon } from '@icons';

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

    try {
      const response = await fetch('/api/tap-list/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          tapList,
          myBeers,
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
    background: var(--color-black);
    border-radius: 20px 20px 0 0;
    max-height: 72vh;
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
    padding: var(--spacing-base);
    padding-top: var(--spacing-sm);
    gap: var(--spacing-base);
  }

  .drawer-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-base);
    flex-shrink: 0;
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
    flex-shrink: 0;
  }

  .chat-input {
    flex: 1;
    border-radius: var(--border-radius);
  }

  .chat-input::placeholder {
    color: var(--color-white-15);
  }
</style>
