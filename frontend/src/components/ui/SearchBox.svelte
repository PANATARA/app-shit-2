<script lang="ts">
  import Icon from "@iconify/svelte";
  import { t } from "$lib/i18n";

  export let searchQuery = "";
  export let placeholder = "";
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
    placeholder={placeholder || $t.common.search}
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
    gap: 10px;
    background: var(--surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-pill, 999px);
    box-shadow: var(--shadow-ambient);
    padding: 11px 16px;
    margin: 0 16px 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .search-box:focus-within {
    border-color: var(--accent);
    box-shadow: 0 2px 10px var(--accent-soft);
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
    background: var(--surface-alt);
    border: none;
    border-radius: 50%;
    color: var(--text-muted);
    font-size: 16px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: transform 0.15s ease;
  }

  .search-clear:active {
    transform: scale(0.9);
  }
</style>
