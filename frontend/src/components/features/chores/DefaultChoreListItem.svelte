<script lang="ts">
  import Icon from "@iconify/svelte";
  import ChoreIcon from "$ui/ChoreIcon.svelte";

  export let chore;
  export let onAdd: () => void;

  function handleAdd(event: MouseEvent) {
    event.stopPropagation();
    onAdd();
  }
</script>

<div class="chore-wrapper">
  <div class="chore-item">
    <ChoreIcon {chore} size={42} />

    <div class="chore-info">
      <span class="chore-name">{chore.name}</span>

      {#if chore.description}
        <span class="chore-desc">{chore.description}</span>
      {/if}
    </div>

    <span class="chore-valuation">
      🪙 {chore.valuation}
    </span>
  </div>

  <button class="add-button" on:click={handleAdd}>
    <Icon
      icon="material-symbols:add-rounded"
      width="24"
      height="24"
    />
  </button>
</div>

<style>
  .chore-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chore-item {
    flex: 1;
    min-width: 0;

    display: flex;
    align-items: center;
    gap: 12px;

    padding: 12px 14px;
    background: var(--bg-card);
    border-radius: 14px;
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
    flex-shrink: 0;

    font-size: 12px;
    color: var(--text-muted);
  }

  .add-button {
    width: 42px;
    height: 42px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;
    border-radius: 50%;

    background: var(--accent);
    color: white;

    cursor: pointer;

    transition:
      transform 0.15s ease,
      opacity 0.15s ease;
  }

  .add-button:active {
    transform: scale(0.9);
    opacity: 0.7;
  }
</style>