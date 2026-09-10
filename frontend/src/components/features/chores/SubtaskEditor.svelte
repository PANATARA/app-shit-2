<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  import {
    parseMessage,
    serializeMessage,
    generateSubtaskId,
    type Subtask,
  } from "$lib/utils/checklist";

  // ─── Props ──────────────────────────────────────────────────────────────────
  export let message: string = "";
  export let placeholder: string = "Добавить пункт...";
  export let commentPlaceholder: string = "Общее примечание или комментарий...";
  export let disabled: boolean = false;
  export let onChange: ((val: string) => void) | undefined = undefined;

  const dispatch = createEventDispatcher<{
    change: string;
    input: string;
  }>();

  // ─── Internal State ────────────────────────────────────────────────────────
  let description = "";
  let subtasks: Subtask[] = [];
  let newSubtaskText = "";
  let lastSynced = "";

  // Synchronize internal state when message prop changes externally
  $: if (message !== lastSynced) {
    const parsed = parseMessage(message);
    description = parsed.description;
    subtasks = parsed.subtasks;
    lastSynced = message ?? "";
  }

  function sync() {
    const serialized = serializeMessage(description, subtasks);
    lastSynced = serialized;
    message = serialized;
    onChange?.(serialized);
    dispatch("change", serialized);
    dispatch("input", serialized);
  }

  function addSubtask() {
    const text = newSubtaskText.trim();
    if (!text || disabled) return;

    subtasks = [
      ...subtasks,
      {
        id: generateSubtaskId(),
        text,
        done: false,
      },
    ];
    newSubtaskText = "";
    sync();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSubtask();
    }
  }

  function toggleSubtask(id: string) {
    if (disabled) return;
    subtasks = subtasks.map((st) =>
      st.id === id ? { ...st, done: !st.done } : st
    );
    sync();
  }

  function removeSubtask(id: string) {
    if (disabled) return;
    subtasks = subtasks.filter((st) => st.id !== id);
    sync();
  }

  function handleDescriptionInput(event: Event) {
    description = (event.target as HTMLTextAreaElement).value;
    sync();
  }
</script>

<div class="subtask-editor">
  <!-- Input row for adding a new subtask (Mobile-First 48px+ tap target) -->
  <div class="add-subtask-row">
    <div class="input-wrapper">
      <input
        type="text"
        class="subtask-input"
        bind:value={newSubtaskText}
        on:keydown={handleKeyDown}
        {placeholder}
        {disabled}
      />
      {#if newSubtaskText}
        <button
          type="button"
          class="clear-input-btn"
          on:click={() => (newSubtaskText = "")}
          aria-label="Очистить поле"
        >
          ×
        </button>
      {/if}
    </div>

    <button
      type="button"
      class="add-btn"
      on:click={addSubtask}
      disabled={disabled || !newSubtaskText.trim()}
      aria-label="Добавить пункт"
    >
      <Icon icon="material-symbols:add-rounded" width="26" height="26" />
    </button>
  </div>

  <!-- List of added subtasks (Large, clear checkboxes and easy-to-hit delete buttons) -->
  {#if subtasks.length > 0}
    <div class="subtasks-list" role="list">
      {#each subtasks as subtask (subtask.id)}
        <div class="subtask-item" class:is-done={subtask.done} role="listitem">
          <button
            type="button"
            class="checkbox-btn"
            class:checked={subtask.done}
            {disabled}
            on:click={() => toggleSubtask(subtask.id)}
            aria-label={subtask.done ? "Отменить отметку" : "Отметить выполненным"}
          >
            {#if subtask.done}
              <svg class="check-svg" viewBox="0 0 12 10" fill="none">
                <path
                  d="M1.5 5L4.5 8L10.5 2"
                  stroke="currentColor"
                  stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            {/if}
          </button>

          <button
            type="button"
            class="subtask-text-btn"
            {disabled}
            on:click={() => toggleSubtask(subtask.id)}
          >
            <span
              class="subtask-text"
              class:completed-text={subtask.done}
            >
              {subtask.text}
            </span>
          </button>

          <button
            type="button"
            class="remove-btn"
            {disabled}
            on:click={() => removeSubtask(subtask.id)}
            aria-label="Удалить пункт"
            title="Удалить пункт"
          >
            <Icon icon="material-symbols:close-rounded" width="20" height="20" />
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <!-- General description/comment block -->
  <div class="description-section">
    <div class="section-header">
      <Icon icon="material-symbols:notes-rounded" width="18" height="18" />
      <span>Примечание</span>
    </div>
    <textarea
      class="description-textarea"
      rows="2"
      value={description}
      on:input={handleDescriptionInput}
      placeholder={commentPlaceholder}
      {disabled}
    ></textarea>
  </div>
</div>

<style>
  .subtask-editor {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
  }

  /* ── Input Row (Mobile-Friendly) ── */
  .add-subtask-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .input-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .subtask-input {
    width: 100%;
    box-sizing: border-box;
    background: var(--surface-alt);
    border: 2px solid var(--border);
    padding: 13px 40px 13px 14px;
    border-radius: 14px;
    font-size: 16px; /* 16px avoids unwanted auto-zoom on iOS */
    font-weight: 500;
    font-family: inherit;
    color: var(--text-primary);
    min-height: 50px;
    outline: none;
    transition: all 0.2s ease;
  }

  .subtask-input:focus {
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: 0 0 0 3px var(--nav-active-bg);
  }

  .clear-input-btn {
    position: absolute;
    right: 12px;
    background: var(--border);
    border: none;
    color: var(--text-secondary);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
  }

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    min-width: 50px;
    border-radius: 14px;
    border: none;
    background: var(--accent);
    color: #ffffff;
    cursor: pointer;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s ease;
    box-shadow: 0 3px 12px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .add-btn:active:not(:disabled) {
    transform: scale(0.92);
  }

  .add-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* ── Subtasks List ── */
  .subtasks-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--surface-alt);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 8px;
  }

  .subtask-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    min-height: 48px;
    box-sizing: border-box;
    border-radius: 12px;
    background: var(--surface);
    border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.15s ease;
  }

  .subtask-item.is-done {
    opacity: 0.7;
    background: color-mix(in srgb, var(--surface) 60%, var(--surface-alt));
  }

  /* ── Checkbox Button: 26px Touch Target ── */
  .checkbox-btn {
    width: 26px;
    height: 26px;
    min-width: 26px;
    border-radius: 8px;
    border: 2px solid color-mix(in srgb, var(--text-secondary) 55%, var(--border));
    background: var(--surface-alt);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: transparent;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .checkbox-btn:hover:not(:disabled) {
    border-color: var(--accent);
    transform: scale(1.05);
  }

  .checkbox-btn:active:not(:disabled) {
    transform: scale(0.9);
  }

  .checkbox-btn.checked {
    border-color: var(--success);
    background: var(--success);
    color: #ffffff;
    box-shadow: 0 2px 10px color-mix(in srgb, var(--success) 35%, transparent);
  }

  .check-svg {
    width: 14px;
    height: 12px;
  }

  .subtask-text-btn {
    border: none;
    background: transparent;
    padding: 6px 0;
    margin: 0;
    text-align: left;
    cursor: pointer;
    flex: 1;
    min-width: 0;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .subtask-text-btn:disabled {
    cursor: default;
  }

  .subtask-text {
    font-size: 15.5px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.35;
    word-break: break-word;
    transition: all 0.15s ease;
  }

  .completed-text {
    text-decoration: line-through;
    color: var(--text-muted);
  }

  /* ── Remove Button: 38px Touch Area ── */
  .remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    min-width: 38px;
    border-radius: 10px;
    border: none;
    background: color-mix(in srgb, var(--border) 40%, transparent);
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s ease;
  }

  .remove-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--danger, #ef4444) 15%, transparent);
    color: var(--danger, #ef4444);
  }

  .remove-btn:active:not(:disabled) {
    transform: scale(0.9);
  }

  /* ── Description Section ── */
  .description-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .description-textarea {
    width: 100%;
    box-sizing: border-box;
    background: var(--surface-alt);
    border: 1.5px solid var(--border);
    padding: 12px 14px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 500;
    font-family: inherit;
    color: var(--text-primary);
    line-height: 1.4;
    resize: vertical;
    min-height: 72px;
    outline: none;
    transition: all 0.2s ease;
  }

  .description-textarea:focus {
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: 0 0 0 3px var(--nav-active-bg);
  }
</style>
