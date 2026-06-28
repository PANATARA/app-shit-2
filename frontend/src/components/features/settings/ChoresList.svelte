<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import BottomSheet from "$ui/BottomSheet.svelte";
  import { getChores, createChore, deleteChore, updateChore } from "$api/chores";
  import { getDefaultChores } from "$api/chores";
  import Icon from "@iconify/svelte";
  import type { ChoreItem, DefaultChore } from "$types/index";

  const dispatch = createEventDispatcher();

  // ─── Types ───────────────────────────────────────────────────────────────

  type Step = 1 | 2 | "3a" | "3b";

  interface ChoreForm {
    name: string;
    description: string;
    icon: string;
    valuation: number;
  }

  // ─── State ───────────────────────────────────────────────────────────────

  let step: Step = 1;
  let searchQuery = "";
  let selectedChore: ChoreItem | null = null;
  let defaultChores: DefaultChore[] = [];

  let chores: ChoreItem[] = [];
  let loading = true;
  let loadingDefaults = false;
  let error = false;

  let form: ChoreForm = {
    name: "",
    description: "",
    icon: "material-symbols:home-rounded",
    valuation: 10,
  };

  let saving = false;
  let deleting = false;
  let isEditing = false;

  // ─── Data fetching ───────────────────────────────────────────────────────

  onMount(loadData);

  async function loadData() {
    loading = true;
    error = false;
    try {
      const raw = await getChores();
      chores = raw.chores ?? [];
    } catch (e) {
      console.error(e);
      error = true;
    } finally {
      loading = false;
    }
  }

  async function loadDefaultChores() {
    loadingDefaults = true;
    try {
      const raw = await getDefaultChores();
      defaultChores = raw ?? [];
    } catch (e) {
      console.error(e);
    } finally {
      loadingDefaults = false;
    }
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  function goToStep(s: Step) {
    step = s;
  }

  function openChoreDetail(chore: ChoreItem) {
    selectedChore = chore;
    isEditing = false;
    goToStep(2);
  }

  function openCreateFromDefault(def: DefaultChore) {
    form = {
      name: def.name,
      description: def.description ?? "",
      icon: def.icon,
      valuation: def.valuation,
    };
    goToStep("3b");
  }

  function openCreateCustom() {
    form = { name: "", description: "", icon: "material-symbols:home-rounded", valuation: 10 };
    goToStep("3b");
  }

  function openEdit() {
    if (!selectedChore) return;
    form = {
      name: selectedChore.name,
      description: selectedChore.description ?? "",
      icon: selectedChore.icon,
      valuation: selectedChore.valuation,
    };
    isEditing = true;
  }

  function reset() {
    step = 1;
    selectedChore = null;
    searchQuery = "";
    isEditing = false;
    form = { name: "", description: "", icon: "material-symbols:home-rounded", valuation: 10 };
  }

  function close() {
    dispatch("close");
    reset();
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function handleSave() {
    saving = true;
    try {
      if (isEditing && selectedChore) {
        const updated = await updateChore(selectedChore.id, form);
        chores = chores.map((c) => (c.id === updated.id ? updated : c));
        selectedChore = updated;
        isEditing = false;
      } else {
        const created = await createChore(form);
        chores = [created, ...chores];
        goToStep(1);
      }
      dispatch("updated");
    } catch (e) {
      console.error(e);
    } finally {
      saving = false;
    }
  }

  async function handleDelete() {
    if (!selectedChore) return;
    deleting = true;
    try {
      await deleteChore(selectedChore.id);
      chores = chores.filter((c) => c.id !== selectedChore!.id);
      dispatch("updated");
      goToStep(1);
    } catch (e) {
      console.error(e);
    } finally {
      deleting = false;
    }
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  $: normalizedQuery = searchQuery.trim().toLowerCase();
  $: filteredChores = normalizedQuery
    ? chores.filter((c) => c.name.toLowerCase().includes(normalizedQuery))
    : chores;

  // ─── Step title ───────────────────────────────────────────────────────────

  $: stepTitle = (() => {
    if (step === 1) return "Мои дела";
    if (step === 2) return selectedChore?.name ?? "";
    if (step === "3a") return "Выбери шаблон";
    if (step === "3b") return isEditing ? "Редактировать" : "Новое дело";
    return "";
  })();
</script>

<BottomSheet title={stepTitle} on:close={close} flyY={999} flyDuration={320}>

  <!-- ─── ШАГ 1: Список дел ──────────────────────────────────────────────── -->
  {#if step === 1}
    <div class="search-box">
      <svg class="search-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        class="search-input"
        type="text"
        placeholder="Поиск..."
        bind:value={searchQuery}
      />
      {#if searchQuery}
        <button class="search-clear" on:click={() => (searchQuery = "")}>×</button>
      {/if}
    </div>

    <button class="create-new-item" on:click={() => { loadDefaultChores(); goToStep("3a"); }}>
      <span class="create-new-icon">+</span>
      <span class="chore-label">Добавить новое дело</span>
    </button>

    {#if loading}
      <div class="state-msg">
        <div class="shimmer-list">
          {#each Array(4) as _}
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
        <button class="retry-btn" on:click={loadData}>Повторить</button>
      </div>
    {:else if filteredChores.length === 0}
      <div class="state-msg">
        <p class="state-text">Дел пока нет</p>
      </div>
    {:else}
      <div class="chore-list">
        {#each filteredChores as chore (chore.id)}
          <button class="chore-item" on:click={() => openChoreDetail(chore)}>
            <div class="chore-icon-wrap">
              <Icon icon={chore.icon} width="22" height="22" color={chore.icon_color ?? "#fff"} />
            </div>
            <div class="chore-info">
              <span class="chore-name">{chore.name}</span>
              {#if chore.description}
                <span class="chore-desc">{chore.description}</span>
              {/if}
            </div>
            <span class="chore-valuation">🪙 {chore.valuation}</span>
            <svg class="chore-arrow" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        {/each}
      </div>
    {/if}

  <!-- ─── ШАГ 2: Детали дела ─────────────────────────────────────────────── -->
  {:else if step === 2 && selectedChore}
    <button class="back-btn" on:click={() => goToStep(1)}>
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Назад
    </button>

    {#if !isEditing}
      <!-- Просмотр -->
      <div class="detail-view">
        <div class="detail-avatar" style="background: {selectedChore.icon_bg ?? '#332a1e'}">
          <Icon icon={selectedChore.icon} width="48" height="48" color={selectedChore.icon_color ?? '#fff'} />
        </div>

        <div class="detail-info">
          {#if selectedChore.description}
            <div class="detail-field">
              <span class="field-label">Описание</span>
              <span class="field-value">{selectedChore.description}</span>
            </div>
          {/if}
          <div class="detail-field">
            <span class="field-label">Награда</span>
            <span class="field-value">🪙 {selectedChore.valuation} монет</span>
          </div>
          <div class="detail-field">
            <span class="field-label">Создано</span>
            <span class="field-value">
              {new Date(selectedChore.created_at).toLocaleDateString("ru-RU", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </span>
          </div>
        </div>

        <div class="detail-actions">
          <button class="btn-edit" on:click={openEdit}>
            <Icon icon="material-symbols:edit-rounded" width="18" height="18" />
            Редактировать
          </button>
          <button class="btn-delete" on:click={handleDelete} disabled={deleting}>
            <Icon icon="material-symbols:delete-rounded" width="18" height="18" />
            {deleting ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>

    {:else}
      <!-- Редактирование -->
      <div class="form-fields">
        <div class="field">
          <label class="field-label">Название</label>
          <input class="field-input" type="text" bind:value={form.name} placeholder="Например: Покормить кота" />
        </div>
        <div class="field">
          <label class="field-label">Описание</label>
          <textarea class="field-input" bind:value={form.description} placeholder="Дополнительные детали..." rows="2"></textarea>
        </div>
        <div class="field">
          <label class="field-label">Награда (монеты)</label>
          <input class="field-input" type="number" bind:value={form.valuation} min="0" max="1000" />
        </div>
        <div class="form-actions">
          <button class="btn-cancel" on:click={() => (isEditing = false)}>Отмена</button>
          <button class="btn-save" on:click={handleSave} disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    {/if}

  <!-- ─── ШАГ 3a: Список шаблонов ───────────────────────────────────────── -->
  {:else if step === "3a"}
    <button class="back-btn" on:click={() => goToStep(1)}>
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Назад
    </button>

    <button class="create-new-item" on:click={openCreateCustom}>
      <span class="create-new-icon">✏️</span>
      <span class="chore-label">Создать своё дело</span>
    </button>

    {#if loadingDefaults}
      <div class="state-msg">
        <div class="shimmer-list">
          {#each Array(4) as _}
            <div class="shimmer-item">
              <div class="shimmer-circle"></div>
              <div class="shimmer-line"></div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="section-label">Стандартные дела</div>
      <div class="chore-list">
        {#each defaultChores as def (def.id)}
          <button class="chore-item" on:click={() => openCreateFromDefault(def)}>
            <div class="chore-icon-wrap">
              <Icon icon={def.icon} width="22" height="22" color={def.icon_color ?? "#fff"} />
            </div>
            <div class="chore-info">
              <span class="chore-name">{def.name}</span>
            </div>
            <span class="chore-valuation">🪙 {def.valuation}</span>
            <svg class="chore-arrow" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        {/each}
      </div>
    {/if}

  <!-- ─── ШАГ 3b: Форма создания/редактирования ─────────────────────────── -->
  {:else if step === "3b"}
    <button class="back-btn" on:click={() => goToStep("3a")}>
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Назад
    </button>

    <div class="form-fields">
      <div class="field">
        <label class="field-label">Название</label>
        <input class="field-input" type="text" bind:value={form.name} placeholder="Например: Покормить собаку" />
      </div>
      <div class="field">
        <label class="field-label">Описание</label>
        <textarea class="field-input" bind:value={form.description} placeholder="Дополнительные детали..." rows="2"></textarea>
      </div>
      <div class="field">
        <label class="field-label">Награда (монеты)</label>
        <input class="field-input" type="number" bind:value={form.valuation} min="0" max="1000" />
      </div>

      <div class="form-actions">
        <button class="btn-cancel" on:click={() => goToStep("3a")}>Отмена</button>
        <button class="btn-save" on:click={handleSave} disabled={saving || !form.name.trim()}>
          {saving ? "Создание..." : "Создать"}
        </button>
      </div>
    </div>
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
    margin: 0 16px 12px;
  }

  .search-icon { color: var(--text-muted); flex-shrink: 0; }

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

  .search-input::placeholder { color: var(--text-muted); }

  .search-clear {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 20px;
    cursor: pointer;
    padding: 0 2px;
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

  .create-new-item:active { opacity: 0.7; }
  .create-new-icon { font-size: 18px; width: 28px; text-align: center; }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    padding: 8px 16px 6px;
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
    padding: 12px 14px;
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

  .chore-item:active { opacity: 0.7; }

  .chore-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: var(--bg, #2a2318);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .chore-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .chore-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .chore-desc {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chore-valuation {
    font-size: 12px;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .chore-arrow { color: var(--text-muted); flex-shrink: 0; }

  /* ── State ───────────────────────────── */
  .state-msg {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px;
    gap: 12px;
  }

  .state-text { font-size: 14px; color: var(--text-muted); }

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

  .shimmer-list { display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 0 16px; }

  .shimmer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    background: var(--bg-card);
    border-radius: 14px;
  }

  .shimmer-circle {
    width: 38px;
    height: 38px;
    border-radius: 11px;
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
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  /* ── Back ───────────────────────────── */
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

  /* ── Detail view ───────────────────────────── */
  .detail-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 8px 16px 0;
  }

  .detail-avatar {
    width: 80px;
    height: 80px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .detail-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .detail-field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: var(--bg-card);
    border-radius: 12px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .field-value {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  }

  .detail-actions {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .btn-edit {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px;
    background: var(--accent-soft);
    border: 1.5px solid var(--accent);
    border-radius: 14px;
    color: var(--accent);
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-edit:active { opacity: 0.7; }

  .btn-delete {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px;
    background: rgba(232, 124, 90, 0.1);
    border: 1.5px solid #e87c5a;
    border-radius: 14px;
    color: #e87c5a;
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-delete:active { opacity: 0.7; }
  .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Form ───────────────────────────── */
  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 0 16px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

  .field-input:focus { border-color: var(--accent); }

  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 6px;
  }

  .btn-cancel {
    flex: 1;
    padding: 13px;
    background: var(--bg-card);
    border: none;
    border-radius: 14px;
    color: var(--text-muted);
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-cancel:active { opacity: 0.7; }

  .btn-save {
    flex: 2;
    padding: 13px;
    background: var(--accent);
    border: none;
    border-radius: 14px;
    color: #2a1800;
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-save:active { opacity: 0.8; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>