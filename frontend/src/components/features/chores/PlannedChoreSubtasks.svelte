<script lang="ts">
  import { parseMessage, serializeMessage, type Subtask } from "$lib/utils/checklist";
  import { updatePlannedChoreMessage } from "$api/chores.js";

  // ─── Component Props ────────────────────────────────────────────────────────
  export let message: string | null = "";
  export let choreId: string | number | null = null;
  export let onUpdate: ((newMessage: string) => void | Promise<void>) | null = null;
  export let isChoreDone: boolean = false;
  export let readonly: boolean = false;

  // ─── Reactive State ────────────────────────────────────────────────────────
  $: parsed = parseMessage(message);
  $: description = parsed.description;
  $: subtasks = parsed.subtasks;
  $: hasSubtasks = parsed.hasSubtasks;

  let isUpdating = false;

  // ─── Toggle Subtask Handler ────────────────────────────────────────────────
  async function handleToggle(subtask: Subtask, event: MouseEvent | TouchEvent) {
    // Isolate click to prevent opening card details
    event.stopPropagation();

    if (readonly || isUpdating) return;

    const previousDone = subtask.done;
    subtask.done = !subtask.done;
    subtasks = [...subtasks];

    const newMessage = serializeMessage(description, subtasks);

    try {
      if (onUpdate) {
        await onUpdate(newMessage);
      }

      if (choreId) {
        isUpdating = true;
        await updatePlannedChoreMessage(String(choreId), newMessage);
      }
    } catch (error) {
      // Revert optimistic update on failure
      subtask.done = previousDone;
      subtasks = [...subtasks];
      console.error("Failed to update chore subtask:", error);
    } finally {
      isUpdating = false;
    }
  }
</script>

<div class="subtasks-container" class:parent-done={isChoreDone}>
  {#if description}
    <div class="description-text" class:completed-text={isChoreDone}>
      {description}
    </div>
  {/if}

  {#if hasSubtasks}
    <div class="checklist" role="list">
      {#each subtasks as subtask (subtask.id)}
        <div class="subtask-row" class:done={subtask.done} role="listitem">
          <button
            type="button"
            class="subtask-checkbox"
            class:checked={subtask.done}
            disabled={readonly}
            on:click={(e) => handleToggle(subtask, e)}
            aria-label={subtask.done ? "Отменить пункт" : "Выполнить пункт"}
          >
            {#if subtask.done}
              <svg
                class="check-icon"
                viewBox="0 0 12 10"
                fill="none"
              >
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
            disabled={readonly}
            on:click={(e) => handleToggle(subtask, e)}
          >
            <span
              class="subtask-text"
              class:completed-text={subtask.done || isChoreDone}
            >
              {subtask.text}
            </span>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .subtasks-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin-top: 4px;
  }

  .description-text {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-secondary);
    word-break: break-word;
    white-space: pre-line;
  }

  .checklist {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  /* ── Mobile-First Touch-Friendly Item Row ── */
  .subtask-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 10px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 12px;
    background: color-mix(in srgb, var(--surface-alt) 80%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s ease;
  }

  .subtask-row:hover {
    background: color-mix(in srgb, var(--accent) 8%, var(--surface-alt));
    border-color: color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .subtask-row:active {
    transform: scale(0.985);
  }

  .subtask-row.done {
    opacity: 0.65;
    background: color-mix(in srgb, var(--surface) 60%, transparent);
    border-color: transparent;
  }

  .subtasks-container.parent-done .subtask-row {
    opacity: 0.55;
  }

  /* ── Larger High-Contrast Checkbox Button ── */
  .subtask-checkbox {
    width: 24px;
    height: 24px;
    min-width: 24px;
    border-radius: 7px;
    border: 2px solid color-mix(in srgb, var(--text-secondary) 55%, var(--border));
    background: var(--surface);
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

  .subtask-checkbox:hover:not(:disabled) {
    border-color: var(--accent);
    transform: scale(1.05);
  }

  .subtask-checkbox:active:not(:disabled) {
    transform: scale(0.9);
  }

  .subtask-checkbox.checked {
    border-color: var(--success);
    background: var(--success);
    color: #ffffff;
    box-shadow: 0 2px 10px color-mix(in srgb, var(--success) 35%, transparent);
  }

  .check-icon {
    width: 14px;
    height: 12px;
    animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* ── Text Click Target ── */
  .subtask-text-btn {
    border: none;
    background: transparent;
    padding: 4px 0;
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
    font-size: 15px;
    font-weight: 600;
    line-height: 1.35;
    color: var(--text-primary);
    word-break: break-word;
    transition: color 0.15s ease, text-decoration 0.15s ease;
  }

  .completed-text {
    text-decoration: line-through;
    color: var(--text-muted);
    font-weight: 500;
  }

  @keyframes popIn {
    from {
      transform: scale(0.4) rotate(-10deg);
      opacity: 0;
    }
    to {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
</style>
