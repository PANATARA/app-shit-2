<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import BottomSheet from "$ui/BottomSheet.svelte";
  import {
    getChores,
    createChore,
    deleteChore,
    updateChore,
    createChoresFromDefault,
  } from "$api/chores";
  import { getDefaultChores } from "$api/chores";
  import Icon from "@iconify/svelte";
  import type { ChoreItem, DefaultChore } from "$types/index";
  import Backbtn from "$ui/backbtn.svelte";
  import SearchBox from "$ui/SearchBox.svelte";
  import ChoreListItem from "$features/chores/ChoreListItem.svelte";
  import AsyncStateView from "$ui/AsyncStateView.svelte";
  import ChoreIcon from "$ui/ChoreIcon.svelte";
  import ChoreFormComp from "$features/settings/ChoreForm.svelte";
  import DefaultChoreListItem from "$features/chores/DefaultChoreListItem.svelte";

  const dispatch = createEventDispatcher();

  // ─── Types ───────────────────────────────────────────────────────────────

  type Step = 1 | 2 | "3a" | "3b";

  interface ChoreForm {
    name: string;
    description: string;
    icon: string;
    icon_color: string;
    icon_bg: string;
    valuation: number;
  }

  // ─── State ───────────────────────────────────────────────────────────────

  let step: Step = 1;
  let searchQuery = "";
  let selectedChore: ChoreItem | null = null;
  let defaultChores: DefaultChore[] = [];

  let chores: ChoreItem[] = [];

  let creatingFromDefault = false;
  let selectedDefaultChore: DefaultChore | null = null;

  let loading = true;
  let loadingDefaults = false;
  let error = false;

  let form: ChoreForm = {
    name: "",
    description: "",
    icon: "material-symbols:home-rounded",
    icon_color: "#000",
    icon_bg: "#fff",
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

  function openCreateCustom() {
    selectedDefaultChore = null;
    creatingFromDefault = false;

    form = {
      name: "",
      description: "",
      icon: "material-symbols:home-rounded",
      icon_color: "#000",
      icon_bg: "#fff",
      valuation: 10,
    };

    goToStep("3b");
  }

  function openEdit() {
    if (!selectedChore) return;
    form = {
      name: selectedChore.name,
      description: selectedChore.description ?? "",
      icon: selectedChore.icon,
      icon_color: selectedChore.icon_color,
      icon_bg: selectedChore.icon_bg,
      valuation: selectedChore.valuation,
    };
    isEditing = true;
  }

  function reset() {
    step = 1;
    searchQuery = "";
    selectedChore = null;

    selectedDefaultChore = null;
    creatingFromDefault = false;

    isEditing = false;

    form = {
      name: "",
      description: "",
      icon: "material-symbols:home-rounded",
      icon_color: "#000",
      icon_bg: "#fff",
      valuation: 10,
    };
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
        let created;
        if (creatingFromDefault && selectedDefaultChore) {
          created = await createChoresFromDefault({
            default_chore_ids: [selectedDefaultChore.id],
            language: "ru",
          });
        } else {
          created = await createChore(form);
        }

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

  async function handleCreateFromDefault(def: DefaultChore) {
    saving = true;
    try {
      let created = await createChoresFromDefault({
        default_chore_ids: [def.id],
        language: "ru",
      });
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
    <SearchBox bind:searchQuery />

    <button
      class="create-new-item"
      on:click={() => {
        loadDefaultChores();
        goToStep("3a");
      }}
    >
      <span class="create-new-icon">+</span>
      <span class="chore-label">Добавить новое дело</span>
    </button>

    <AsyncStateView
      {loading}
      {error}
      errorMessage="Не удалось загрузить дела"
      onRetry={loadData}
      empty={filteredChores.length === 0}
      emptyMessage="Дел пока нет"
      shimmerCount={7}
    >
      <div class="section-label">Дела моего семейного круга</div>
      <div class="chore-list">
        {#each filteredChores as chore (chore.id)}
          <ChoreListItem {chore} on:click={() => openChoreDetail(chore)} />
        {/each}
      </div>
    </AsyncStateView>

    <!-- ─── ШАГ 2: Детали дела ─────────────────────────────────────────────── -->
  {:else if step === 2 && selectedChore}
    {#if !isEditing}
      <Backbtn label="Назад" on:click={() => goToStep(1)} />
      <!-- Просмотр -->
      <div class="detail-view">
        <ChoreIcon chore={selectedChore} size={80} />
        <div class="detail-info">
          {#if selectedChore.description}
            <div class="detail-field detail-field--block">
              <span class="field-label">Описание</span>
              <span class="field-value field-value--wrap"
                >{selectedChore.description}</span
              >
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
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div class="detail-actions">
          <button class="btn-edit" on:click={openEdit}>
            <Icon icon="material-symbols:edit-rounded" width="18" height="18" />
            Редактировать
          </button>
          <button
            class="btn-delete"
            on:click={handleDelete}
            disabled={deleting}
          >
            <Icon
              icon="material-symbols:delete-rounded"
              width="18"
              height="18"
            />
            {deleting ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    {:else}
      <ChoreFormComp
        bind:form
        {selectedChore}
        mode="edit"
        {saving}
        submitText="Сохранить"
        cancelText="Отмена"
        onCancel={() => (isEditing = false)}
        onSubmit={handleSave}
      />
    {/if}

    <!-- ─── ШАГ 3a: Список шаблонов ───────────────────────────────────────── -->
  {:else if step === "3a"}
    <Backbtn label="Назад" on:click={() => goToStep(1)} />

    <button class="create-new-item" on:click={openCreateCustom}>
      <span class="create-new-icon">✏️</span>
      <span class="chore-label">Создать своё дело</span>
    </button>

    <AsyncStateView loading={loadingDefaults} shimmerCount={7}>
      <div class="section-label">Стандартные дела</div>
      <div class="chore-list">
        {#each defaultChores as def (def.id)}
          <DefaultChoreListItem
            chore={def}
            onAdd={() => handleCreateFromDefault(def)}
          />
        {/each}
      </div>
    </AsyncStateView>

    <!-- ─── ШАГ 3b: Форма создания/редактирования ─────────────────────────── -->
  {:else if step === "3b"}
    <ChoreFormComp
      bind:form
      mode="create"
      {saving}
      submitText="Создать"
      cancelText="Отмена"
      onCancel={() => goToStep("3a")}
      onSubmit={handleSave}
    />
  {/if}
</BottomSheet>

<style>
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
    font-size: 18px;
    width: 28px;
    text-align: center;
  }

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
  /* ── Detail view ───────────────────────────── */
  .detail-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 8px 16px 0;
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
    gap: 12px;
  }

  .detail-field--block {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
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
    text-align: right;
    min-width: 0;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .field-value--wrap {
    width: 100%;
    text-align: left;
    white-space: pre-wrap;
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

  .btn-edit:active {
    opacity: 0.7;
  }

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

  .btn-delete:active {
    opacity: 0.7;
  }
  .btn-delete:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
