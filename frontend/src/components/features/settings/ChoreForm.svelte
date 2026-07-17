<script lang="ts">
  import AvatarConstructor from "$features/settings/AvatarConstructor.svelte";
  import ChoreIcon from "$ui/ChoreIcon.svelte";
  import CustomInput from "$ui/CustomInput.svelte";
  import CustomTextarea from "$ui/CustomTextarea.svelte";

  export let form;
  export let selectedChore = null;

  export let mode: "create" | "edit" = "create";

  export let saving = false;

  export let submitText = "Создать";
  export let cancelText = "Отмена";

  export let onCancel: () => void;
  export let onSubmit: () => void;

  $: isDefaultChore = !!selectedChore?.default_chore_id;

  function updateAvatar(e) {
    const { icon, icon_color, icon_bg } = e.detail;

    form = {
      ...form,
      icon,
      icon_color,
      icon_bg,
    };
  }
</script>

<div class="form-fields">
  <!-- Аватар -->
  {#if isDefaultChore}
    <div class="avatar-wrapper">
      <ChoreIcon chore={selectedChore} size={80} />
    </div>
  {:else}
    <AvatarConstructor
      initialIcon={form.icon}
      initialIconColor={form.icon_color}
      initialBg={form.icon_bg}
      on:change={updateAvatar}
    />
  {/if}

  <!-- Название -->
  <div class="field">
    <label class="field-label"> Название </label>

    <CustomInput
      bind:value={form.name}
      placeholder="Например: Покормить кота"
      disabled={isDefaultChore}
    />
  </div>

  <!-- Описание -->
  <div class="field">
    <label class="field-label"> Описание </label>

    <CustomTextarea
      bind:value={form.description}
      placeholder="Дополнительные детали..."
      maxlength={500}
      rows={3}
    />
  </div>

  <!-- Награда -->
  <div class="field">
    <label class="field-label"> Награда (монеты) </label>

    <CustomInput
      bind:value={form.valuation}
      inputType="number"
      min={0}
      max={999}
    />
  </div>

  <div class="form-actions">
    <button class="btn-cancel" on:click={onCancel}>
      {cancelText}
    </button>

    <button
      class="btn-save"
      on:click={onSubmit}
      disabled={saving || (mode === "create" && !form.name.trim())}
    >
      {saving ? "Сохранение..." : submitText}
    </button>
  </div>
</div>

<style>
  .avatar-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

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

  .btn-cancel:active {
    opacity: 0.7;
  }

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

  .btn-save:active {
    opacity: 0.8;
  }
  .btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
