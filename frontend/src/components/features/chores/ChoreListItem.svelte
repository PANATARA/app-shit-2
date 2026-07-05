<script lang="ts">
  import Icon from "@iconify/svelte";
  import { createEventDispatcher } from "svelte";
  import ChoreIcon from "$ui/ChoreIcon.svelte";

  export let chore;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch("click", chore);
  }
</script>

<button class="chore-item" on:click={handleClick}>
  <ChoreIcon {chore} size={42}/>
  <div class="chore-info">
    <span class="chore-name">{chore.name}</span>
    {#if chore.description}
      <span class="chore-desc">{chore.description}</span>
    {/if}
  </div>
  <span class="chore-valuation">🪙 {chore.valuation}</span>
  <svg
    class="chore-arrow"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
</button>

<style>
  .chore-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg-card);
    border: none;
    border-radius: 14px;
    color: var(--text-primary);
    font-size: 15px;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    transition: opacity 0.1s;
  }

  .chore-item:active {
    opacity: 0.7;
  }

  .chore-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .chore-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .chore-desc {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chore-valuation {
    font-size: 12px;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .chore-arrow {
    color: var(--text-muted);
    flex-shrink: 0;
  }
</style>
