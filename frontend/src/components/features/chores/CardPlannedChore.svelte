<script lang="ts">
  import type { PlannedChore } from "$types/index";
  import ChoreIcon from "$ui/ChoreIcon.svelte";
  import UserAvatar from "$ui/UserAvatar.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let item: PlannedChore;
  export let onToggle: (item: PlannedChore) => void;
  console.log(item);

  $: done = item.completed_by !== null;
  $: title = item.chore.name;
  $: icon = item.chore.icon || "🧹";
  $: comment = item.message;
  $: assignee = item.assigned_to;
  $: assigneeLetters = assignee
    ? (assignee.name?.[0] ?? "") + (assignee.surname?.[0] ?? "")
    : "?";
  $: completer = item.completed_by;
  $: completerLetters = completer
    ? (completer.name?.[0] ?? "") + (completer.surname?.[0] ?? "")
    : "?";

  function handleComplete() {
    onToggle?.(item);
  }
</script>

<div
  class="card"
  class:card-done={done}
  on:click
  on:keydown={(e) => e.key === "Enter" && dispatch("click")}
  role="button"
  tabindex="0"
>
  <ChoreIcon chore={item.chore} />
  <div class="content">
    <div class="title" class:completed-text={done}>{title}</div>
    {#if comment}
      <div class="subtitle" class:completed-text={done}>{comment}</div>
    {/if}
    {#if assignee}
      <div class="assignee-badge">
        <UserAvatar user={item.assigned_to} size={20} />
        <span class="name">Назначено: {assignee.name}</span>
      </div>
    {/if}
    {#if completer}
      <div class="completed-badge">
        <UserAvatar user={item.completed_by} size={20} />
        <span class="name">Выполнил: {completer.name}</span>
      </div>
    {/if}
  </div>
  <div class="right">
    <button
      class="check"
      class:checked={done}
      on:click|stopPropagation={handleComplete}
      aria-label="Завершить задачу"
    >
      {#if done}
        <svg
          class="check-icon"
          width="12"
          height="10"
          viewBox="0 0 12 10"
          fill="none"
        >
          <path
            d="M1.5 5L4.5 8L10.5 2"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {/if}
    </button>
  </div>
</div>

<style>
  .card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    overflow: hidden;
  }

  .card:hover {
    transform: translateY(-2px);
    background: var(--surface-alt);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    border-color: var(--accent-soft);
  }

  .card.card-done {
    opacity: 0.65;
    background: var(--surface);
    border-color: transparent;
    box-shadow: none;
    transform: none;
  }

  /* ── CONTENT ───────────────────────────── */
  .content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
    transition: all 0.2s;
  }

  .subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: all 0.2s;
  }

  .completed-text {
    text-decoration: line-through;
    color: var(--text-muted);
  }

  /* ── ASSIGNEE BADGE ───────────────────────────── */
  .assignee-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface-alt);
    padding: 3px 8px;
    border-radius: 12px;
    align-self: flex-start;
    margin-top: 4px;
    border: 1px solid var(--border);
  }

  .card-done .assignee-badge {
    background: transparent;
    border-color: var(--border);
  }

  .name {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .completed-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 12px;
    align-self: flex-start;
    margin-top: 4px;

    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  /* ── CHECK BUTTON ───────────────────────────── */
  .right {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .check {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    padding: 0;
  }

  .check:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
    transform: scale(1.1);
  }

  .check:active {
    transform: scale(0.9);
  }

  .check.checked {
    border-color: var(--success);
    background: var(--success);
    color: #fff;
  }

  .check-icon {
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes popIn {
    0% {
      transform: scale(0) rotate(-15deg);
      opacity: 0;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
</style>
