<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import BottomSheet from "./BottomSheet.svelte";
  import { getChores } from "../api/chores";
  import { getStatisticsOnFamilyChore } from "../api/stats";
  import type { ChoreItem } from "../types";

  const dispatch = createEventDispatcher();

  // ─── Types ───────────────────────────────────────────────────────────────

  type RepeatOption = "none" | "daily" | "weekly" | "monthly";

  interface ChoreWithUsage extends ChoreItem {
    usageCount: number;
  }

  // ─── State ───────────────────────────────────────────────────────────────

  let modalStep: 1 | 2 = 1;
  let selectedChore: ChoreWithUsage | null = null;
  let comment = "";
  let dueDate = "";
  let repeat: RepeatOption = "none";
  let assignedTo: string | null = null;
  let searchQuery = "";

  let chores: ChoreWithUsage[] = [];
  let loading = true;
  let error = false;

  const FREQUENT_THRESHOLD = 5;

  const repeatOptions: { value: RepeatOption; label: string }[] = [
    { value: "none", label: "Не повторять" },
    { value: "daily", label: "Каждый день" },
    { value: "weekly", label: "Каждую неделю" },
    { value: "monthly", label: "Каждый месяц" },
  ];

  const fakeUsers = [
    { id: "1", name: "Алекс", avatar: "АЛ" },
    { id: "2", name: "Мария", avatar: "МА" },
    { id: "3", name: "Дима", avatar: "ДИ" },
    { id: "4", name: "Соня", avatar: "СО" },
  ];

  // ─── Data fetching ───────────────────────────────────────────────────────

  onMount(loadChores);

  async function loadChores() {
    loading = true;
    error = false;
    try {
      const [rawChores, stats] = await Promise.all([
        getChores(),
        getStatisticsOnFamilyChore({
          start_date: getDateNDaysAgo(30),
          end_date: getTodayIso(),
        }),
      ]);
      console.log(rawChores);

      const usageMap = new Map(
        stats.map((s) => [s.chore_id, s.chores_completions_counts]),
      );

      // присоединяем usageCount из статистики и сортируем
      chores = rawChores.chores
        .map((c) => ({ ...c, usageCount: usageMap.get(c.id) ?? 0 }))
        .sort((a, b) => b.usageCount - a.usageCount);
    } catch (e) {
      console.error("Failed to load chores:", e);
      error = true;
    } finally {
      loading = false;
    }
  }

  function getTodayIso(): string {
    return new Date().toISOString().split("T")[0];
  }

  function getDateNDaysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  function reset() {
    modalStep = 1;
    selectedChore = null;
    comment = "";
    dueDate = "";
    repeat = "none";
    assignedTo = null;
    searchQuery = "";
  }

  function close() {
    dispatch("close");
    reset();
  }

  function selectChore(chore: ChoreWithUsage) {
    selectedChore = chore;
    modalStep = 2;
  }

  function selectNewChore(title: string) {
    selectChore({
      id: "-1",
      name: title,
      icon: "🧹",
      description: "",
      valuation: 0,
      usageCount: 0,
    });
  }

  function add() {
    dispatch("add", {
      ...selectedChore,
      comment,
      dueDate,
      repeat,
      assignedTo: fakeUsers.find((u) => u.id === assignedTo) ?? null,
    });
    close();
  }

  // ─── Search & filtering ──────────────────────────────────────────────────
  // сортировка уже сделана при загрузке, здесь только фильтрация по поиску

  $: normalizedQuery = searchQuery.trim().toLowerCase();

  $: filteredChores = normalizedQuery
    ? chores.filter((c) => c.name.toLowerCase().includes(normalizedQuery))
    : chores;

  $: frequentChores = filteredChores.filter(
    (c) => c.usageCount >= FREQUENT_THRESHOLD,
  );
  $: otherChores = filteredChores.filter(
    (c) => c.usageCount < FREQUENT_THRESHOLD,
  );

  $: hasExactMatch = filteredChores.some(
    (c) => c.name.toLowerCase() === normalizedQuery,
  );

  $: showCreateNew = normalizedQuery.length > 0 && !hasExactMatch;
</script>

<BottomSheet
  title={modalStep === 1 ? "Выбери дело" : (selectedChore?.name ?? "")}
  on:close={close}
  flyY={999}
  flyDuration={320}
>
  {#if modalStep === 1}
    <div class="search-box">
      <svg
        class="search-icon"
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        class="search-input"
        type="text"
        placeholder="Поиск или новое дело..."
        bind:value={searchQuery}
      />
      {#if searchQuery}
        <button class="search-clear" on:click={() => (searchQuery = "")}
          >×</button
        >
      {/if}
    </div>

    {#if loading}
      <div class="state-msg">
        <div class="shimmer-list">
          {#each Array(5) as _}
            <div class="shimmer-item">
              <div class="shimmer-circle"></div>
              <div class="shimmer-line"></div>
            </div>
          {/each}
        </div>
      </div>
    {:else if error}
      <div class="state-msg">
        <p class="state-text">Не удалось загрузить дела</p>
        <button class="retry-btn" on:click={loadChores}>Повторить</button>
      </div>
    {:else}
      {#if showCreateNew}
        <button
          class="create-new-item"
          on:click={() => selectNewChore(searchQuery.trim())}
        >
          <span class="create-new-icon">+</span>
          <span class="chore-label">Создать «{searchQuery.trim()}»</span>
        </button>
      {/if}

      {#if frequentChores.length > 0}
        <div class="section-label">Часто используемые</div>
        <div class="chore-list">
          {#each frequentChores as chore (chore.id)}
            <button class="chore-item" on:click={() => selectChore(chore)}>
              <span class="chore-icon">{chore.icon}</span>
              <span class="chore-label">{chore.name}</span>
              <svg
                class="chore-arrow"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          {/each}
        </div>
      {/if}

      {#if otherChores.length > 0}
        {#if frequentChores.length > 0}
          <div class="section-label">Все дела</div>
        {/if}
        <div class="chore-list">
          {#each otherChores as chore (chore.id)}
            <button class="chore-item" on:click={() => selectChore(chore)}>
              <span class="chore-icon">{chore.icon}</span>
              <span class="chore-label">{chore.name}</span>
              <svg
                class="chore-arrow"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          {/each}
        </div>
      {/if}

      {#if filteredChores.length === 0 && !showCreateNew}
        <div class="state-msg">
          <p class="state-text">Ничего не найдено</p>
        </div>
      {/if}
    {/if}
  {:else}
    <button class="back-btn" on:click={() => (modalStep = 1)}>
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Назад
    </button>

    <div class="selected-header">
      <span class="selected-icon">{selectedChore?.icon}</span>
    </div>

    <div class="detail-form">
      <div class="field">
        <label class="field-label">Кому назначить</label>
        <div class="users-row">
          <button
            class="user-btn"
            class:user-active={assignedTo === null}
            on:click={() => (assignedTo = null)}
          >
            <div class="user-avatar avatar-none">—</div>
            <span>Никому</span>
          </button>
          {#each fakeUsers as user}
            <button
              class="user-btn"
              class:user-active={assignedTo === user.id}
              on:click={() => (assignedTo = user.id)}
            >
              <div class="user-avatar">{user.avatar}</div>
              <span>{user.name}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="field">
        <label class="field-label">Комментарий</label>
        <textarea
          class="field-input"
          bind:value={comment}
          placeholder="Дополнительные детали..."
          rows="2"
        ></textarea>
      </div>

      <div class="field">
        <label class="field-label">Дата выполнения</label>
        <input class="field-input" type="date" bind:value={dueDate} />
      </div>

      <div class="field">
        <label class="field-label">Повторять</label>
        <div class="repeat-grid">
          {#each repeatOptions as opt}
            <button
              class="repeat-btn"
              class:repeat-active={repeat === opt.value}
              on:click={() => (repeat = opt.value)}
            >
              {opt.label}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <button class="add-btn" on:click={add}>Добавить</button>
  {/if}
</BottomSheet>

<style>
  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 10px 14px;
    margin: 0 16px 14px;
  }

  .search-icon {
    color: var(--text-muted);
    flex-shrink: 0;
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
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
    flex-shrink: 0;
  }

  .state-msg {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px;
    gap: 12px;
  }

  .state-text {
    font-size: 14px;
    color: var(--text-muted);
  }

  .retry-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px 18px;
    font-size: 14px;
    font-family: inherit;
    color: var(--accent);
    cursor: pointer;
  }

  .shimmer-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    padding: 0 16px;
  }

  .shimmer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    background: var(--bg-card);
    border-radius: 14px;
  }

  .shimmer-circle {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--border);
    flex-shrink: 0;
    animation: shimmer 1.2s ease-in-out infinite;
  }

  .shimmer-line {
    flex: 1;
    height: 14px;
    border-radius: 6px;
    background: var(--border);
    animation: shimmer 1.2s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  .section-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 12px 16px 8px;
  }

  .create-new-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: calc(100% - 32px);
    padding: 13px 14px;
    background: var(--accent-soft);
    border: 1.5px dashed var(--accent);
    border-radius: 14px;
    color: var(--accent);
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    margin: 0 16px 12px;
    transition: opacity 0.1s;
  }

  .create-new-item:active {
    opacity: 0.7;
  }
  .create-new-icon {
    font-size: 20px;
    width: 28px;
    text-align: center;
  }

  .chore-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0 16px;
  }

  .chore-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    background: var(--bg-card);
    border: none;
    border-radius: 14px;
    color: var(--text-primary);
    font-size: 15px;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    transition: opacity 0.1s;
  }

  .chore-item:active {
    opacity: 0.7;
  }

  .chore-icon {
    font-size: 20px;
    width: 28px;
    text-align: center;
  }
  .chore-label {
    flex: 1;
    font-weight: 500;
  }
  .chore-arrow {
    color: var(--text-muted);
    flex-shrink: 0;
  }

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
    margin-top: -4px;
  }

  .selected-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 0;
  }

  .selected-icon {
    font-size: 32px;
  }

  .detail-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 16px 4px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .field-input {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 11px 14px;
    color: var(--text-primary);
    font-size: 15px;
    font-family: inherit;
    resize: none;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .field-input:focus {
    border-color: var(--accent);
  }

  .field-input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.6);
  }

  .users-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .users-row::-webkit-scrollbar {
    display: none;
  }

  .user-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    flex-shrink: 0;
    padding: 0;
  }

  .user-avatar {
    width: 46px;
    height: 46px;
    border-radius: 15px;
    background: var(--bg-card);
    border: 2px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    transition: all 0.15s;
  }

  .avatar-none {
    font-size: 18px;
    color: var(--text-muted);
  }

  .user-btn span {
    font-size: 11px;
    color: var(--text-muted);
    transition: color 0.15s;
  }

  .user-active .user-avatar {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
  }

  .user-active span {
    color: var(--accent);
  }

  .repeat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .repeat-btn {
    padding: 10px 8px;
    background: var(--bg-card);
    border: 1.5px solid transparent;
    border-radius: 12px;
    color: var(--text-secondary);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }

  .repeat-btn:active {
    opacity: 0.7;
  }

  .repeat-active {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }

  .add-btn {
    width: calc(100% - 32px);
    margin: 20px 16px 0;
    padding: 15px;
    background: var(--accent);
    border: none;
    border-radius: 16px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .add-btn:active {
    opacity: 0.8;
  }
</style>
