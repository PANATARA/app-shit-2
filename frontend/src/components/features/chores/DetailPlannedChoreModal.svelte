<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import BottomSheet from "$ui/BottomSheet.svelte";
  import UserAvatar from "$ui/UserAvatar.svelte";
  import ChoreIcon from "$ui/ChoreIcon.svelte";
  import Icon from "@iconify/svelte";
  import {
    deletePlannedChore,
    reschedulePlannedChore,
    completePlannedChore,
    unCompletePlannedChore,
  } from "$api/chores";
  import type { PlannedChore } from "$types/index";

  const dispatch = createEventDispatcher();

  // ─── Props ───────────────────────────────────────────────────────────────

  export let plannedChore: PlannedChore;

  // ─── State ───────────────────────────────────────────────────────────────

  type Step = "detail" | "reschedule";
  let step: Step = "detail";

  let newDate = plannedChore.due_date;
  let loading = false;

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function close() {
    dispatch("close");
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function handleDelete() {
    loading = true;
    try {
      await deletePlannedChore(plannedChore.id);
      dispatch("deleted", plannedChore.id);
      close();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleComplete() {
    loading = true;
    try {
      const updated = plannedChore.completed_by
        ? await unCompletePlannedChore(plannedChore.id)
        : await completePlannedChore(plannedChore.id);
      dispatch("updated", updated);
      close();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleReschedule() {
    if (!newDate || newDate === plannedChore.due_date) return;
    loading = true;
    try {
      const updated = await reschedulePlannedChore(plannedChore.id, {
        due_date: newDate,
      });
      dispatch("updated", updated);
      close();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }
</script>

<BottomSheet
  title={step === "detail" ? plannedChore.chore.name : "Перенести задачу"}
  on:close={close}
  flyY={999}
  flyDuration={320}
>
  {#if step === "detail"}
    <!-- ── Иконка ── -->
    <div class="chore-header">
      <ChoreIcon chore={plannedChore.chore} size={80} />
      {#if plannedChore.message}
        <p class="chore-message">«{plannedChore.message}»</p>
      {/if}
    </div>

    <!-- ── Детали ── -->
    <div class="details">
      <!-- Дата -->
      <div class="detail-row">
        <div class="detail-icon-wrap">
          <Icon
            icon="material-symbols:calendar-today-rounded"
            width="18"
            height="18"
          />
        </div>
        <div class="detail-text">
          <span class="detail-label">Дата</span>
          <span class="detail-value">{formatDate(plannedChore.due_date)}</span>
        </div>
      </div>

      <!-- Назначено -->
      <div class="detail-row">
        <div class="detail-icon-wrap">
          <Icon icon="material-symbols:person-rounded" width="18" height="18" />
        </div>
        <div class="detail-text">
          <span class="detail-label">Назначено</span>
          {#if plannedChore.assigned_to}
            <div class="user-chip">
              <UserAvatar user={plannedChore.assigned_to} size={24} />
              <span class="detail-value">
                {plannedChore.assigned_to.name}
                {plannedChore.assigned_to.surname}
              </span>
            </div>
          {:else}
            <span class="detail-value muted">Никому</span>
          {/if}
        </div>
      </div>

      <!-- Выполнено -->
      <div class="detail-row">
        <div class="detail-icon-wrap">
          <Icon
            icon="material-symbols:check-circle-rounded"
            width="18"
            height="18"
            color={plannedChore.completed_by
              ? "var(--success, #6ab8a0)"
              : "var(--text-muted)"}
          />
        </div>
        <div class="detail-text">
          <span class="detail-label">Выполнено</span>
          {#if plannedChore.completed_by}
            <div class="user-chip">
              <UserAvatar user={plannedChore.completed_by} size={24} />
              <span class="detail-value">
                {plannedChore.completed_by.name}
                {plannedChore.completed_by.surname}
              </span>
            </div>
          {:else}
            <span class="detail-value muted">Ещё нет</span>
          {/if}
        </div>
      </div>

      <!-- Награда -->
      <div class="detail-row">
        <div class="detail-icon-wrap">
          <Icon icon="material-symbols:paid-rounded" width="18" height="18" />
        </div>
        <div class="detail-text">
          <span class="detail-label">Награда</span>
          <span class="detail-value"
            >🪙 {plannedChore.chore.valuation} монет</span
          >
        </div>
      </div>
    </div>

    <!-- ── Кнопки действий ── -->
    <div class="actions">
      <!-- Выполнить / Отменить выполнение -->
      <button
        class="action-btn"
        class:action-success={!plannedChore.completed_by}
        class:action-warn={!!plannedChore.completed_by}
        on:click={handleComplete}
        disabled={loading}
      >
        <Icon
          icon={plannedChore.completed_by
            ? "material-symbols:undo-rounded"
            : "material-symbols:check-rounded"}
          width="18"
          height="18"
        />
        {plannedChore.completed_by
          ? "Отменить выполнение"
          : "Отметить выполненным"}
      </button>

      <!-- Перенести -->
      {#if !plannedChore.completed_by}
        <button
          class="action-btn action-neutral"
          on:click={() => (step = "reschedule")}
          disabled={loading}
        >
          <Icon
            icon="material-symbols:calendar-month-rounded"
            width="18"
            height="18"
          />
          Перенести
        </button>
      {/if}

      <!-- Удалить -->
      <button
        class="action-btn action-danger"
        on:click={handleDelete}
        disabled={loading}
      >
        <Icon icon="material-symbols:delete-rounded" width="18" height="18" />
        {loading ? "Удаление..." : "Удалить задачу"}
      </button>
    </div>
  {:else if step === "reschedule"}
    <button class="back-btn" on:click={() => (step = "detail")}>
      <Icon icon="material-symbols:arrow-back-rounded" width="18" height="18" />
      Назад
    </button>

    <div class="reschedule-wrap">
      <p class="reschedule-hint">Выберите новую дату для задачи</p>

      <input
        class="date-input"
        type="date"
        bind:value={newDate}
        min={new Date().toISOString().split("T")[0]}
      />

      <button
        class="action-btn action-success"
        on:click={handleReschedule}
        disabled={loading || !newDate || newDate === plannedChore.due_date}
      >
        <Icon icon="material-symbols:check-rounded" width="18" height="18" />
        {loading ? "Сохранение..." : "Подтвердить перенос"}
      </button>
    </div>
  {/if}
</BottomSheet>

<style>
  /* ── Header ───────────────────────── */
  .chore-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 8px 16px 4px;
  }

  .chore-message {
    font-size: 14px;
    color: var(--text-muted);
    font-style: italic;
    text-align: center;
    margin: 0;
  }

  /* ── Details ───────────────────────── */
  .details {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 16px 4px;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg-card);
    border-radius: 14px;
  }

  .detail-icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    flex-shrink: 0;
  }

  .detail-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .detail-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .detail-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .detail-value.muted {
    color: var(--text-muted);
    font-weight: 400;
  }

  .user-chip {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Actions ───────────────────────── */
  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px 4px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .action-btn:active {
    opacity: 0.7;
  }
  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-success {
    background: rgba(106, 184, 160, 0.15);
    color: var(--success, #6ab8a0);
    border: 1.5px solid var(--success, #6ab8a0);
  }

  .action-warn {
    background: rgba(232, 168, 124, 0.1);
    color: var(--accent, #e8a87c);
    border: 1.5px solid var(--accent, #e8a87c);
  }

  .action-neutral {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1.5px solid var(--border);
  }

  .action-danger {
    background: rgba(232, 124, 90, 0.1);
    color: #e87c5a;
    border: 1.5px solid #e87c5a;
  }

  /* ── Back ───────────────────────── */
  .back-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: var(--accent);
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    padding: 0 16px;
    margin-bottom: 8px;
  }

  /* ── Reschedule ───────────────────────── */
  .reschedule-wrap {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 8px 16px 4px;
  }

  .reschedule-hint {
    font-size: 14px;
    color: var(--text-muted);
    text-align: center;
    margin: 0;
  }

  .date-input {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 13px 14px;
    color: var(--text-primary);
    font-size: 16px;
    font-family: inherit;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .date-input:focus {
    border-color: var(--accent);
  }

  .date-input::-webkit-calendar-picker-indicator {
    filter: invert(0.6);
  }
</style>
