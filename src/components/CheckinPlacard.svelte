<script lang="ts">
  import type { Checkin } from '@models';
  import { formatDate } from '@utils';
  import { BuildingIcon } from '@icons';

  export let checkin: Checkin;
  export let light: boolean = false;

  $: ratingClasses = new Array(5).fill('').map((v, i) => {
    const diff = checkin.rating - i;
    return diff >= 1
      ? 'fill'
      : diff === 0.75
      ? 'three-quarter'
      : diff === 0.5
      ? 'half'
      : diff === 0.25
      ? 'quarter'
      : '';
  });
</script>

<article data-checkin-id={checkin.id} class="checkin padding-base top-border">
  {#if !light}
    <p>
      <a class="link" href={`/beer/${checkin.beer.slug}`}>
        <span class="brewery-name">{checkin.brewery.name}</span>
        <span class="beer-name"><strong>{checkin.beer.name}</strong></span>
      </a>
    </p>
    <p>
      {checkin.beer.style}
    </p>
  {/if}

  <p class:fw-bold={light} class:fs-xs={!light} class:color-opacity-50={!light}>
    {formatDate(checkin.createdAt.toString())}
  </p>

  {#if checkin.venue}
    <p class="fs-sm venue"><BuildingIcon />{checkin.venue.name}</p>
  {/if}

  <div class="rating margin-top-sm">
    {#if checkin.rating}
      {#each ratingClasses as cl}
        <span class={cl} />
      {/each}
    {:else}
      <p class="fs-xs">No rating!</p>
    {/if}
  </div>
</article>

<style lang="scss">
  .checkin {
    display: grid;
    gap: var(--spacing-sm);
  }

  .venue {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    :global(svg) {
      width: 18px;
      opacity: 0.5;
    }
  }

  .rating {
    display: flex;
    gap: var(--spacing-xs);
    span {
      position: relative;
      display: block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      overflow: hidden;
      background-color: var(--color-white-25);

      &:before {
        content: '';
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        background-color: var(--color-primary);
      }

      &.quarter:before {
        width: 25%;
      }
      &.half:before {
        width: 50%;
      }
      &.three-quarter:before {
        width: 75%;
      }
      &.fill:before {
        width: 100%;
      }
    }
  }
</style>
