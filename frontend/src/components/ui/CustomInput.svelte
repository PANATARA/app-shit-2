<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  export let value = "";
  export let placeholder = "";
  export let icon = "🏡";
  export let maxlength = 36;
  export let showClear = true;

  function clear() {
    value = "";
  }

  const dispatch = createEventDispatcher();

  function handleInput(event: Event) {
    value = (event.target as HTMLInputElement).value;
    dispatch("inputChange", value);
  }
</script>

<div class="input-container">
  <span class="input-icon-left">
    {icon}
  </span>

  <input
    type="text"
    value={value}
    on:input={handleInput}
    {placeholder}
    {maxlength}
    class="custom-input"
  />

  {#if value && showClear}
    <button
      class="clear-btn"
      on:click={clear}
      transition:fade={{ duration: 120 }}
      type="button"
      aria-label="Очистить"
    >
      ×
    </button>
  {/if}
</div>

<style>
  /* ── КРАСИВЫЙ ИНПУТ С ИКОНКОЙ ── */
  .input-container {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .input-icon-left {
    position: absolute;
    left: 14px;
    font-size: 18px;
    pointer-events: none;
  }

  .custom-input {
    width: 100%;
    box-sizing: border-box;
    background: var(--surface-alt);
    border: 1.5px solid var(--border);
    padding: 14px 44px 14px 42px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    transition: all 0.2s ease;
  }

  .custom-input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: 0 0 0 3px var(--nav-active-bg);
  }

  .clear-btn {
    position: absolute;
    right: 14px;
    background: var(--border);
    border: none;
    color: var(--text-secondary);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s ease;
  }

  .clear-btn:hover {
    background: var(--text-muted);
    color: var(--surface);
  }
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0) rotate(0);
    }
    50% {
      transform: translateY(-3px) rotate(15deg);
    }
  }
</style>
