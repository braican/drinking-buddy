<script lang="ts">
  // A loading note that cycles through a few phrasings beside the filling pint, for
  // waits long enough that a static line reads as a hung page.
  import { LoadingIcon } from '@icons';

  interface Props {
    /** Shown in order, looping. The first one should be the literal, useful one. */
    messages: string[];
    /** Milliseconds between swaps. */
    interval?: number;
    /**
     * Stable text for assistive tech. The cycling copy is decorative and hidden
     * from it — announcing a new phrase every few seconds is noise, not progress.
     */
    label?: string;
    /** The filling-pint icon. On by default; it's the app's loading idiom. */
    icon?: boolean;
  }

  let { messages, interval = 2600, label, icon = true }: Props = $props();

  let index = $state(0);

  $effect(() => {
    if (messages.length < 2) return;

    // Reading `index` inside the callback doesn't make it a dependency — tracking
    // only covers the effect's synchronous run — so this can't loop on itself.
    const id = setInterval(() => {
      index = (index + 1) % messages.length;
    }, interval);

    return () => clearInterval(id);
  });
</script>

<!-- A div, not a p: LoadingIcon renders a div, and a div inside a p is invalid
     markup that browsers auto-close, splitting the row apart. -->
<div class="loading" role="status" aria-label={label ?? messages[0]}>
  {#if icon}
    <span class="loading-icon" aria-hidden="true">
      <LoadingIcon />
    </span>
  {/if}

  {#key index}
    <span class="message" aria-hidden="true">{messages[index]}</span>
  {/key}
</div>

<style lang="scss">
  .loading {
    display: flex;
    align-items: center;
    gap: var(--spacing-base);
    // Dims and brightens rather than shifting hue: the pint is already carrying the
    // amber, and two competing colour cycles read as busy.
    animation: throb 2s ease-in-out infinite;
  }

  .loading-icon {
    flex-shrink: 0;
    display: flex;
  }

  .message {
    // Animating opacity here, colour on the parent — one property each, so the swap
    // and the throb can't fight over the same value.
    animation: swap-in 400ms ease;
  }

  @keyframes throb {
    0%,
    100% {
      color: var(--color-white);
    }
    50% {
      color: color-mix(in srgb, var(--color-white) 45%, transparent);
    }
  }

  @keyframes swap-in {
    from {
      opacity: 0;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  // Keep the words, drop the motion. The pint has its own animation, which stays —
  // it's the only thing signalling progress once these stop.
  @media (prefers-reduced-motion: reduce) {
    .loading,
    .message {
      animation: none;
    }
  }
</style>
