<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  type RepeatOption = "none" | "daily" | "weekly" | "monthly";

  let modalStep: 1 | 2 = 1;
  let selectedChore: any = null;
  let comment = "";
  let dueDate = "";
  let repeat: RepeatOption = "none";
  let assignedTo: string | null = null;

  const choreTemplates = [
    { id: 1, title: "Пылесос", icon: "🧹" },
    { id: 2, title: "Посуда", icon: "🍽️" },
    { id: 3, title: "Мусор", icon: "🗑️" },
    { id: 4, title: "Стирка", icon: "👕" },
    { id: 5, title: "Прогулка с собакой", icon: "🐕" },
    { id: 6, title: "Полить цветы", icon: "🌱" },
    { id: 7, title: "Протереть пыль", icon: "🧽" },
    { id: 8, title: "Глажка", icon: "👔" },
    { id: 9, title: "Мытьё окон", icon: "🪟" },
    { id: 10, title: "Чистка ванной", icon: "🚿" },
  ];

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

  function reset() {
    modalStep = 1;
    selectedChore = null;
    comment = "";
    dueDate = "";
    repeat = "none";
    assignedTo = null;
  }

  function close() {
    dispatch("close");
    reset();
  }

  function selectChore(chore: any) {
    selectedChore = chore;
    modalStep = 2;
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
</script>

<div
  class="backdrop"
  role="button"
  tabindex="0"
  on:click={close}
  on:keydown={(e) => e.key === "Escape" && close()}
></div>

<div class="modal">
  <div class="modal-handle"></div>

  {#if modalStep === 1}
    <h3 class="modal-title">Выбери дело</h3>
    <div class="chore-list">
      {#each choreTemplates as chore}
        <button class="chore-item" on:click={() => selectChore(chore)}>
          <span class="chore-icon">{chore.icon}</span>
          <span class="chore-label">{chore.title}</span>
          <svg class="chore-arrow" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      {/each}
    </div>

  {:else}
    <button class="back-btn" on:click={() => (modalStep = 1)}>
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Назад
    </button>

    <div class="selected-header">
      <span class="selected-icon">{selectedChore.icon}</span>
      <h3 class="modal-title" style="margin:0">{selectedChore.title}</h3>
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
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 20;
  }

  .modal {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 21;
    background: var(--surface);
    border-radius: 24px 24px 0 0;
    padding: 0 16px calc(32px + env(safe-area-inset-bottom));
    max-height: 85vh;
    overflow-y: auto;
  }

  .modal-handle {
    width: 36px;
    height: 4px;
    background: var(--text-muted);
    border-radius: 2px;
    margin: 12px auto 0;
  }

  .modal-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    padding: 16px 0 12px;
    margin: 0;
  }

  .chore-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .chore-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    background: var(--surface-alt);
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

  .chore-icon { font-size: 20px; width: 28px; text-align: center; }
  .chore-label { flex: 1; font-weight: 500; }
  .chore-arrow { color: var(--text-muted); flex-shrink: 0; }

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
    padding: 12px 0 0;
  }

  .selected-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 8px 0 4px;
  }

  .selected-icon { font-size: 26px; }

  .detail-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0 4px;
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
    background: var(--surface-alt);
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

  .field-input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.6);
  }

  /* users */
  .users-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .users-row::-webkit-scrollbar { display: none; }

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
    background: var(--surface-alt);
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

  .user-active span { color: var(--accent); }

  /* repeat */
  .repeat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .repeat-btn {
    padding: 10px 8px;
    background: var(--surface-alt);
    border: 1.5px solid transparent;
    border-radius: 12px;
    color: var(--text-secondary);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }

  .repeat-btn:active { opacity: 0.7; }

  .repeat-active {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }

  .add-btn {
    width: 100%;
    margin-top: 20px;
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

  .add-btn:active { opacity: 0.8; }
</style>