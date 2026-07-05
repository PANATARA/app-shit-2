<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import BottomSheet from "$ui/BottomSheet.svelte";
  import RepeatSelector from "$features/chores/RepeatSelector.svelte";
  import { getChores, createPlannedChore } from "$api/chores";
  import { getFamilyMembers } from "$api/family";
  import type { ChoreItem, FamilyMembers } from "$types/index";
  import UserAvatar from "$ui/UserAvatar.svelte";
  import SearchBox from "$ui/SearchBox.svelte";
  import ChoreListItem from "$features/chores/ChoreListItem.svelte";
  import AsyncStateView from "$ui/AsyncStateView.svelte";
  import ChoreIcon from "$ui/ChoreIcon.svelte";
  import Backbtn from "$ui/backbtn.svelte";

  const dispatch = createEventDispatcher();

  // ─── Types ───────────────────────────────────────────────────────────────

  type FrequencyType = "none" | "daily" | "weekly" | "monthly";

  interface RepeatConfig {
    frequency_type: FrequencyType;
    interval: number;
    days_of_week: number[];
    day_of_month: number | null;
    starts_at: string;
    ends_at: string | null;
  }

  // ─── State ───────────────────────────────────────────────────────────────

  let modalStep: 1 | 2 = 1;
  let selectedChore: ChoreItem | null = null;
  let comment = "";
  let dueDate = "";
  let assignedTo: string | null = null;
  let searchQuery = "";

  let chores: ChoreItem[] = [];
  let familyMembers: FamilyMembers | null = null;
  let loading = true;
  let error = false;

  let repeat: RepeatConfig = {
    frequency_type: "none",
    interval: 1,
    days_of_week: [],
    day_of_month: null,
    starts_at: getTodayIso(),
    ends_at: null,
  };

  // ─── Data fetching ───────────────────────────────────────────────────────

  onMount(loadData);

  async function loadData() {
    loading = true;
    error = false;
    try {
      const [rawChores, members] = await Promise.all([
        getChores(),
        getFamilyMembers(),
      ]);
      // бэкенд уже вернул отсортированный список — просто сохраняем
      chores = rawChores.chores ?? [];
      familyMembers = members;
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

  // ─── Navigation ──────────────────────────────────────────────────────────

  function reset() {
    modalStep = 1;
    selectedChore = null;
    comment = "";
    dueDate = "";
    repeat = {
      frequency_type: "none",
      interval: 1,
      days_of_week: [],
      day_of_month: null,
      starts_at: getTodayIso(),
      ends_at: null,
    };
    assignedTo = null;
    searchQuery = "";
  }

  function close() {
    dispatch("close");
    reset();
  }

  function selectChore(chore: ChoreItem) {
    selectedChore = chore;
    modalStep = 2;
  }

  async function add() {
    if (!selectedChore) return;

    const payload = {
      message: comment || "",
      assigned_to_id: assignedTo,
      due_date: dueDate || null,
    };

    try {
      const res = await createPlannedChore(selectedChore.id, payload);
      const assignedUser =
        familyMembers?.members.find((u) => u.id === assignedTo) ?? null;

      dispatch("add", {
        chore: selectedChore,
        comment,
        dueDate,
        repeat,
        assignedTo: assignedUser,
        apiResponse: res,
      });

      close();
    } catch (e) {
      console.error("Failed to create planned chore:", e);
    }
  }

  // ─── Search & filtering ───────────────────────────────────────────────────
  // сортировка на бэкенде, здесь только фильтрация по поиску

  $: normalizedQuery = searchQuery.trim().toLowerCase();

  $: filteredChores = normalizedQuery
    ? chores.filter((c) => c.name.toLowerCase().includes(normalizedQuery))
    : chores;

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
    <SearchBox bind:searchQuery />

    <AsyncStateView
      {loading}
      {error}
      errorMessage="Не удалось загрузить дела"
      onRetry={loadData}
      shimmerCount={5}
    >
      {#if showCreateNew}
        <button
          class="create-new-item"
          on:click={() => selectChore(searchQuery.trim())}
        >
          <span class="create-new-icon">+</span>
          <span class="chore-label">Создать «{searchQuery.trim()}»</span>
        </button>
      {/if}

      {#if filteredChores.length > 0}
        <div class="chore-list">
          {#each filteredChores as chore (chore.id)}
            <ChoreListItem {chore} on:click={() => selectChore(chore)} />
          {/each}
        </div>
      {:else if !showCreateNew}
        <div class="state-msg">
          <p class="state-text">Ничего не найдено</p>
        </div>
      {/if}
    </AsyncStateView>
  {:else}
    <Backbtn label="Назад" on:click={() => (modalStep = 1)} />

    <div class="selected-header">
      <ChoreIcon chore={selectedChore} size={90} />
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
            <UserAvatar size={46} />
            <span>Никому</span>
          </button>
          {#each familyMembers?.members ?? [] as user}
            <button
              class="user-btn"
              class:user-active={assignedTo === user.id}
              on:click={() => (assignedTo = user.id)}
            >
              <UserAvatar {user} size={46} />
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
        <RepeatSelector bind:value={repeat} />
      </div>
    </div>

    <button class="add-btn" on:click={add}>Добавить</button>
  {/if}
</BottomSheet>

<style>
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

  .user-btn span {
    font-size: 11px;
    color: var(--text-muted);
    transition: color 0.15s;
  }

  .user-active span {
    color: var(--accent);
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
