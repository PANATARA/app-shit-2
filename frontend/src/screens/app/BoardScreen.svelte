<script lang="ts">
  import { onMount } from "svelte";
  import { slide, fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import WeekCalendar from "$ui/WeekCalendar.svelte";
  import CardPlannedChore from "@/components/features/chores/CardPlannedChore.svelte";
  import CreatePlannedChore from "@/components/features/chores/CreatePlannedChore.svelte";
  import DetailPlannedChoreModal from "$features/chores/DetailPlannedChoreModal.svelte";
  import {
    completePlannedChore,
    getPlannedChore,
    unCompletePlannedChore,
  } from "$api/chores";
  import type { PlannedChore } from "$types/index";

  // ─── State ───────────────────────────────────────────────────────────────────

  let selectedDate = new Date();
  let loading = false;
  let modalOpen = false;
  let plannedChores: PlannedChore[] = [];
  let selectedPlannedChore: PlannedChore | null = null;
  let detailModalOpen = false;

  onMount(() => {
    loadPlannedChores(formatDateKey(new Date()));
  });

  // ─── Data fetching ───────────────────────────────────────────────────────────

  async function loadPlannedChores(due_date: string) {
    loading = true;
    try {
      plannedChores = await getPlannedChore({ due_date });
      console.log(plannedChores);
    } catch (e) {
      console.error("Failed to load planned chores:", e);
    } finally {
      loading = false;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getFriendlyDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Сегодня";
    if (date.toDateString() === tomorrow.toDateString()) return "Завтра";
    if (date.toDateString() === yesterday.toDateString()) return "Вчера";

    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  // ─── Event handlers ──────────────────────────────────────────────────────────

  function handleDateChange(event: CustomEvent<Date>) {
    selectedDate = event.detail;
    loadPlannedChores(formatDateKey(selectedDate));
  }

  async function toggleChore(choreItem: PlannedChore) {
    const previous = plannedChores;

    const isCompleted = choreItem.completed_by !== null;

    plannedChores = plannedChores.map((c) =>
      c.id === choreItem.id
        ? {
            ...c,
            completed_by: isCompleted ? null : c.assigned_to,
          }
        : c,
    );

    try {
      const updated = isCompleted
        ? await unCompletePlannedChore(choreItem.id)
        : await completePlannedChore(choreItem.id);

      plannedChores = plannedChores.map((c) =>
        c.id === updated.id ? updated : c,
      );
    } catch (e) {
      plannedChores = previous;
      console.error(e);
    }
  }

  // ─── Reactive ────────────────────────────────────────────────────────────────

  $: currentDueDateStr = formatDateKey(selectedDate);
  $: dateChores = plannedChores.filter((c) => c.due_date === currentDueDateStr);
  $: activePlannedChores = dateChores.filter((c) => c.completed_by === null);
  $: completedPlannedChores = dateChores.filter((c) => c.completed_by !== null);
  $: totalCount = dateChores.length;
  $: completedCount = completedPlannedChores.length;
  $: progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
</script>

<div class="screen">
  <!-- Calendar Widget -->
  <div class="calendar-card">
    <WeekCalendar {selectedDate} on:change={handleDateChange} />
  </div>

  <!-- Progress Bar Header -->
  <div class="progress-section">
    <div class="progress-info">
      <span class="progress-title">{getFriendlyDate(selectedDate)}</span>
      {#if totalCount > 0}
        <span class="progress-ratio"
          >{completedCount} из {totalCount} выполнено</span
        >
      {:else}
        <span class="progress-ratio">Задач нет</span>
      {/if}
    </div>
    {#if totalCount > 0}
      <div class="progress-bar-bg" transition:slide|local>
        <div
          class="progress-bar-fill"
          style="width: {progressPercentage}%"
        ></div>
      </div>
    {/if}
  </div>

  <button
    class="add-task-btn"
    on:click={() => (modalOpen = true)}
    aria-label="Добавить задачу"
  >
    <span>Добавить задачу</span>
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  </button>

  <!-- MAIN LIST CONTROLLER -->
  {#if loading}
    <div class="shimmer-wrapper" in:fade={{ duration: 150 }}>
      {#each Array(2) as _}
        <div class="shimmer-card">
          <div class="shimmer-circle"></div>
          <div class="shimmer-lines">
            <div class="shimmer-line title-line"></div>
            <div class="shimmer-line desc-line"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if totalCount === 0}
    <!-- Absolute Zero Empty State -->
    <div class="empty-state perfect-empty" in:fade={{ duration: 200 }}>
      <div class="empty-icon-large">🏕️</div>
      <h3>Планы отсутствуют</h3>
      <p>
        На этот день пока не запланировано никаких домашних дел. Добавьте задачу
        с помощью кнопки ниже!
      </p>
    </div>
  {:else}
    <!-- ACTIVE CHORES -->
    <div class="section">
      <div class="section-header">
        <h2>АКТИВНЫЕ</h2>
        <span class="section-count">{activePlannedChores.length}</span>
      </div>

      <div class="list">
        {#if activePlannedChores.length === 0}
          <div class="empty-state clean-success" in:fade={{ duration: 200 }}>
            <div class="empty-icon">🎉</div>
            <h3>Все дела сделаны!</h3>
            <p>
              Отличная работа! Все запланированные задачи на сегодня успешно
              завершены.
            </p>
          </div>
        {:else}
          {#each activePlannedChores as chore (chore.id)}
            <div
              transition:slide|local={{ duration: 250 }}
              animate:flip={{ duration: 250 }}
            >
              <CardPlannedChore
                item={chore}
                onToggle={toggleChore}
                on:click={() => {
                  selectedPlannedChore = chore;
                  detailModalOpen = true;
                }}
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- COMPLETED CHORES -->
    {#if completedPlannedChores.length > 0}
      <div class="section" transition:slide|local={{ duration: 250 }}>
        <div class="section-header">
          <h2>ВЫПОЛНЕННЫЕ</h2>
          <span class="section-count completed-count-badge"
            >{completedPlannedChores.length}</span
          >
        </div>

        <div class="list">
          {#each completedPlannedChores as plannedChore (plannedChore.id)}
            <div
              transition:slide|local={{ duration: 250 }}
              animate:flip={{ duration: 250 }}
            >
              <CardPlannedChore
                item={plannedChore}
                onToggle={toggleChore}
                on:click={() => {
                  selectedPlannedChore = plannedChore;
                  detailModalOpen = true;
                }}
              />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

  {#if modalOpen}
    <CreatePlannedChore on:close={() => (modalOpen = false)} />
  {:else if detailModalOpen && selectedPlannedChore}
    <DetailPlannedChoreModal
      plannedChore={selectedPlannedChore}
      on:close={() => (detailModalOpen = false)}
      on:deleted={(e) => {
        plannedChores = plannedChores.filter((c) => c.id !== e.detail);
      }}
      on:updated={(e) => {
        plannedChores = plannedChores.map((c) =>
          c.id === e.detail.id ? e.detail : c,
        );
      }}
    />
  {/if}
</div>

<style>
  .screen {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-sizing: border-box;
    width: 100%;
    min-height: 100%;
  }

  /* ── CALENDAR CARD ───────────────────────────── */
  .calendar-card {
    background: var(--surface);
    padding: 12px;
    border-radius: 24px;
    border: 1px solid var(--border);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  }

  /* ── PROGRESS SECTION ─────────────────────────── */
  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
    text-transform: capitalize;
  }

  .progress-ratio {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--surface);
    padding: 4px 10px;
    border-radius: 12px;
    border: 1px solid var(--border);
  }

  .progress-bar-bg {
    height: 8px;
    background: var(--surface-alt);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent) 0%, var(--success) 100%);
    border-radius: 4px;
    transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* ── SECTION HEADERS ─────────────────────────── */
  .section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 4px;
  }

  h2 {
    font-size: 12px;
    font-weight: 800;
    color: var(--text-muted);
    letter-spacing: 1.2px;
    margin: 0;
  }

  .section-count {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 2px 8px;
    border-radius: 10px;
  }

  .completed-count-badge {
    color: var(--success);
    background: var(--success-soft);
  }

  /* ── LISTS ───────────────────────────────────── */
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── EMPTY STATES ─────────────────────────────── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    background: var(--surface);
    border: 1.5px dashed var(--border);
    border-radius: 24px;
    text-align: center;
    box-sizing: border-box;
  }

  .empty-icon {
    font-size: 32px;
    margin-bottom: 10px;
  }

  .empty-icon-large {
    font-size: 42px;
    margin-bottom: 12px;
  }

  .empty-state h3 {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 6px 0;
  }

  .empty-state p {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
    max-width: 260px;
    line-height: 1.45;
  }

  .perfect-empty {
    padding: 48px 20px;
    margin-top: 10px;
  }

  /* ── SHIMMER LOADING STATES ──────────────────── */
  .shimmer-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .shimmer-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
  }

  .shimmer-circle {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: linear-gradient(
      90deg,
      var(--surface-alt) 25%,
      var(--border) 50%,
      var(--surface-alt) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .shimmer-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .shimmer-line {
    height: 12px;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--surface-alt) 25%,
      var(--border) 50%,
      var(--surface-alt) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .shimmer-line.title-line {
    width: 50%;
    height: 14px;
  }

  .shimmer-line.desc-line {
    width: 35%;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  .add-task-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;

    padding: 1rem 1.25rem;
    border: none;
    border-radius: 18px;

    background: var(--accent-soft);
    color: white;

    font-size: 1rem;
    font-weight: 700;

    cursor: pointer;
    transition:
      transform 0.15s ease,
      opacity 0.15s ease,
      box-shadow 0.2s ease;

    box-shadow:
      0 10px 25px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .add-task-btn:hover {
    transform: translateY(-1px);
  }

  .add-task-btn:active {
    transform: scale(0.98);
  }

  .add-task-btn svg {
    flex-shrink: 0;
  }
</style>
