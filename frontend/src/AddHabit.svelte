<script lang="ts">
  import { onMount } from "svelte";
  import { slide, fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import WeekCalendar from "./components/WeekCalendar.svelte";
  import ChoreCard from "./components/choreCard.svelte";
  import AddChoreModal from "./components/addChoreModal.svelte";

  let selectedDate = new Date();
  let loading = false;
  let modalOpen = false;

  // Local storage setup to make the daily chores persistence fully operational
  const LOCAL_STORAGE_KEY = "household_chores_v2";

  const initialDummyChores = [
    {
      id: "dummy-1",
      title: "Пылесос",
      icon: "🧹",
      comment: "В зале и в спальне под кроватью",
      dueDate: new Date().toLocaleDateString("sv"),
      assignedTo: { id: "1", name: "Алекс", avatar: "АЛ" },
      done: false
    },
    {
      id: "dummy-2",
      title: "Посуда",
      icon: "🍽️",
      comment: "Помыть сковороду и разложить тарелки",
      dueDate: new Date().toLocaleDateString("sv"),
      assignedTo: { id: "2", name: "Мария", avatar: "МА" },
      done: true
    },
    {
      id: "dummy-3",
      title: "Мусор",
      icon: "🗑️",
      comment: "Вынести раздельный сбор",
      dueDate: new Date().toLocaleDateString("sv"),
      assignedTo: { id: "3", name: "Дима", avatar: "ДИ" },
      done: true
    },
    {
      id: "dummy-4",
      title: "Прогулка с собакой",
      icon: "🐕",
      comment: "Поиграть с мячиком в парке",
      dueDate: new Date(Date.now() + 86400000).toLocaleDateString("sv"),
      assignedTo: { id: "4", name: "Соня", avatar: "СО" },
      done: false
    },
    {
      id: "dummy-5",
      title: "Стирка",
      icon: "👕",
      comment: "Режим деликатной стирки для шерсти",
      dueDate: new Date(Date.now() + 86400000).toLocaleDateString("sv"),
      assignedTo: { id: "1", name: "Алекс", avatar: "АЛ" },
      done: false
    }
  ];

  let chores: any[] = [];

  onMount(() => {
    loadChores();
  });

  function loadChores() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        chores = JSON.parse(saved);
      } else {
        chores = [...initialDummyChores];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chores));
      }
    } catch (e) {
      console.error(e);
      chores = [...initialDummyChores];
    }
  }

  function saveChores() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chores));
    } catch (e) {
      console.error(e);
    }
  }

  // Format date helper matching YYYY-MM-DD
  function formatDateKey(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getFriendlyDate(date: Date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Сегодня";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Завтра";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера";
    }

    return date.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  }

  function handleDateChange(event: CustomEvent<Date>) {
    selectedDate = event.detail;
    loading = true;
    setTimeout(() => {
      loading = false;
    }, 250);
  }

  function handleChoreComplete(choreItem: any) {
    chores = chores.map((c) => {
      if (c.id === choreItem.id) {
        return { ...c, done: !c.done };
      }
      return c;
    });
    saveChores();
  }

  function handleAdd(event: CustomEvent) {
    const detail = event.detail;
    
    const newChore = {
      id: "chore-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      title: detail.title || "Новая задача",
      icon: detail.icon || "🧹",
      comment: detail.comment || "",
      dueDate: detail.dueDate || formatDateKey(selectedDate),
      assignedTo: detail.assignedTo,
      repeat: detail.repeat || "none",
      done: false
    };

    chores = [newChore, ...chores];
    saveChores();
  }

  // Reactive computations for active date
  $: currentDueDateStr = formatDateKey(selectedDate);
  $: dateChores = chores.filter((c) => c.dueDate === currentDueDateStr);
  $: activeChores = dateChores.filter((c) => !c.done);
  $: completedChores = dateChores.filter((c) => c.done);

  $: totalCount = dateChores.length;
  $: completedCount = completedChores.length;
  $: progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
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
        <span class="progress-ratio">{completedCount} из {totalCount} выполнено</span>
      {:else}
        <span class="progress-ratio">Задач нет</span>
      {/if}
    </div>
    {#if totalCount > 0}
      <div class="progress-bar-bg" transition:slide|local>
        <div class="progress-bar-fill" style="width: {progressPercentage}%"></div>
      </div>
    {/if}
  </div>

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
      <p>На этот день пока не запланировано никаких домашних дел. Добавьте задачу с помощью кнопки ниже!</p>
    </div>
  {:else}
    <!-- ACTIVE CHORES -->
    <div class="section">
      <div class="section-header">
        <h2>АКТИВНЫЕ</h2>
        <span class="section-count">{activeChores.length}</span>
      </div>

      <div class="list">
        {#if activeChores.length === 0}
          <div class="empty-state clean-success" in:fade={{ duration: 200 }}>
            <div class="empty-icon">🎉</div>
            <h3>Все дела сделаны!</h3>
            <p>Отличная работа! Все запланированные задачи на сегодня успешно завершены.</p>
          </div>
        {:else}
          {#each activeChores as chore (chore.id)}
            <div transition:slide|local={{ duration: 250 }} animate:flip={{ duration: 250 }}>
              <ChoreCard item={chore} onComplete={handleChoreComplete} />
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- COMPLETED CHORES -->
    {#if completedChores.length > 0}
      <div class="section" transition:slide|local={{ duration: 250 }}>
        <div class="section-header">
          <h2>ВЫПОЛНЕННЫЕ</h2>
          <span class="section-count completed-count-badge">{completedChores.length}</span>
        </div>

        <div class="list">
          {#each completedChores as chore (chore.id)}
            <div transition:slide|local={{ duration: 250 }} animate:flip={{ duration: 250 }}>
              <ChoreCard item={chore} onComplete={handleChoreComplete} />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

  <!-- Floating Action Button -->
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button class="fab" on:click={() => (modalOpen = true)} aria-label="Добавить задачу">
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  </button>

  {#if modalOpen}
    <AddChoreModal on:close={() => (modalOpen = false)} on:add={handleAdd} />
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
    background: linear-gradient(90deg, var(--surface-alt) 25%, var(--border) 50%, var(--surface-alt) 75%);
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
    background: linear-gradient(90deg, var(--surface-alt) 25%, var(--border) 50%, var(--surface-alt) 75%);
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

  /* ── FAB BUTTON ──────────────────────────────── */
  .fab {
    position: fixed;
    bottom: calc(96px + env(safe-area-inset-bottom));
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: var(--accent);
    border: none;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(213, 138, 114, 0.35);
    cursor: pointer;
    z-index: 10;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .fab:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 30px rgba(213, 138, 114, 0.5);
  }

  .fab:active {
    transform: scale(0.92);
  }
</style>