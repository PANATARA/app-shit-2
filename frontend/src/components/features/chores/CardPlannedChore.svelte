<script lang="ts">
  import type { PlannedChore } from "$types/index";
  import ChoreIcon from "$ui/ChoreIcon.svelte";
  import UserAvatar from "$ui/UserAvatar.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let item: PlannedChore;
  export let onToggle: (item: PlannedChore) => void;

  $: done = item.completed_by !== null;
  $: title = item.chore.name;
  $: icon = item.chore.icon || "🧹";
  $: comment = item.message;
  $: assignee = item.assigned_to;
  $: completer = item.completed_by;

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
  <!-- декоративный glow -->
  {#if !done}
    <span class="glow" />
  {/if}

  <ChoreIcon chore={item.chore} />

  <div class="content">
    <div class="title" class:completed-text={done}>{title}</div>
    {#if comment}
      <div class="subtitle" class:completed-text={done}>{comment}</div>
    {/if}
    {#if assignee && !completer}
      <div class="assignee-badge">
        <UserAvatar user={item.assigned_to} size={18} />
        <span class="name">{assignee.name}</span>
      </div>
    {/if}
    {#if completer}
      <div class="completed-badge">
        <UserAvatar user={item.completed_by} size={18} />
        <span class="name">{completer.name}</span>
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
        <svg class="check-icon" width="12" height="10" viewBox="0 0 12 10" fill="none">
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
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 24px;
    background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--accent) 5%, var(--surface)) 0%,
      var(--surface) 50%
    );
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.04),
      0 4px 12px rgba(0, 0, 0, 0.06),
      0 12px 28px rgba(0, 0, 0, 0.05);
    transition:
      opacity 0.25s ease,
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.2s ease;
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .card:active {
    transform: scale(0.98);
  }

  /* glow в правом верхнем углу */
  .glow {
    position: absolute;
    width: 160px;
    height: 160px;
    right: -60px;
    top: -70px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    filter: blur(32px);
    pointer-events: none;
  }

  .card.card-done {
    opacity: 0.55;
    background: var(--surface);
    box-shadow: none;
  }

  /* ── CONTENT ─────────────────────────────────── */
  .content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    z-index: 1;
  }

  .title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
    transition: color 0.2s ease;
  }

  .subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .completed-text {
    text-decoration: line-through;
    color: var(--text-muted);
  }

  /* ── BADGES ──────────────────────────────────── */
  .assignee-badge,
  .completed-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px 3px 4px;
    border-radius: 99px;
    align-self: flex-start;
    margin-top: 5px;
  }

  .assignee-badge {
    background: color-mix(in srgb, var(--accent) 8%, var(--surface-alt));
    border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .completed-badge {
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .name {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  /* ── CHECK BUTTON ────────────────────────────── */
  .right {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .check {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    padding: 0;
    transition:
      transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
      background-color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .check:active {
    transform: scale(0.88);
  }

  .check.checked {
    border-color: var(--success);
    background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--success) 80%, white),
      var(--success)
    );
    color: #fff;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--success) 35%, transparent);
  }

  .check-icon {
    animation: checkAppear 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes checkAppear {
    from { transform: scale(0) rotate(-20deg); opacity: 0; }
    to   { transform: scale(1) rotate(0); opacity: 1; }
  }
</style>
