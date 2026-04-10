<div class="pint-loading" aria-label="Loading...">
  <svg viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="glass-clip">
      <path d="M4 4 L6 44 L26 44 L28 4 Z" />
    </clipPath>
    <rect class="fill-liquid" x="0" y="0" width="32" height="48" clip-path="url(#glass-clip)" />
    <path d="M4 4 L6 44 L26 44 L28 4 Z" stroke="currentColor" stroke-width="2" fill="none" />
    <line x1="4" y1="4" x2="28" y2="4" stroke="currentColor" stroke-width="2" />
  </svg>
</div>

<style lang="scss">
  .pint-loading {
    svg {
      width: 24px;
      height: auto;
      color: var(--color-white-25);
    }

    .fill-liquid {
      fill: var(--color-primary);
      transform-origin: bottom center;
      animation: fill-up 1.4s ease-in-out infinite alternate;
    }
  }

  @keyframes fill-up {
    from {
      transform: translateY(48px);
    }
    to {
      transform: translateY(8px);
    }
  }
</style>
