<script lang="ts">
  import Icon from "@iconify/svelte";
  export let searchQuery = "";
</script>

<div class="search-box">
  <Icon
    icon="material-symbols:search-rounded"
    width="22"
    height="22"
    style="color: var(--text-muted)"
  />
  <input
    class="search-input"
    type="text"
    placeholder="Поиск..."
    bind:value={searchQuery}
  />
  {#if searchQuery}
    <button class="search-clear" on:click={() => (searchQuery = "")}>×</button>
  {/if}
</div>

<style>
  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 10px 14px;
    margin: 0 16px 12px;
  }

  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 15px;
    font-family: inherit;
    min-width: 0;
  }

  .search-input::placeholder {
    color: var(--text-muted);
  }

  .search-clear {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 20px;
    cursor: pointer;
    padding: 0 2px;
  }
</style>
