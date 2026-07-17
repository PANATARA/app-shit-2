<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  export let value = "";
  export let placeholder = "";
  export let maxlength = 300;
  export let rows = 4;
  export let showClear = true;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  function clear() {
    value = "";
    dispatch("inputChange", value);
  }

  function handleInput(event: Event) {
    value = (event.target as HTMLTextAreaElement).value;
    dispatch("inputChange", value);
  }
</script>

<div class="textarea-container">
  <textarea
    bind:value
    on:input={handleInput}
    {placeholder}
    {maxlength}
    {rows}
    disabled={disabled}
    class="custom-textarea"
  ></textarea>

  {#if value && showClear && !disabled}
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
  .textarea-container {
    position: relative;
    width: 100%;
    display: flex;
  }

  .custom-textarea {
    width: 100%;
    box-sizing: border-box;
    background: var(--surface-alt);
    border: 1.5px solid var(--border);
    padding: 14px 44px 14px 14px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    color: var(--text-primary);
    line-height: 1.4;
    resize: vertical;
    min-height: 90px;
    transition: all 0.2s ease;
  }

  .custom-textarea:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: 0 0 0 3px var(--nav-active-bg);
  }

  .custom-textarea:disabled {
    background: var(--surface-disabled, #eeeeee);
    color: var(--text-muted);
    border-color: var(--border);
    cursor: not-allowed;
    opacity: 0.7;
    resize: none;
  }

  .clear-btn {
    position: absolute;
    top: 14px;
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
</style>