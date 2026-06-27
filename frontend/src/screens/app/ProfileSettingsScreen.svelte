<script lang="ts">
  import { onMount } from "svelte";
  import { getFamily, getFamilyMembers } from "$api/family";
  import { getProfile, updateProfile } from "$api/me";
  import type { FamilyMembers, UserProfile, FamilyProfile } from "$types/index";
  import UserAvatar from "$ui/UserAvatar.svelte";
  import Block from "$ui/block.svelte";
  import Icon from "@iconify/svelte";
  import AvatarConstructor from "$features/settings/AvatarConstructor.svelte";
  import ToggleSwitch from "$ui/ToggleSwitch.svelte";

  // ─── STATE MACHINE ─────────────────────────────
  let notificationsEnabled = true;
  async function handleClick(e) {
    const value = e.detail;

    notificationsEnabled = value;

    // console.log(e);
    console.log(value);
  }

  let loading = true;
  let error = false;

  let meUser: UserProfile | null = null;
  let familyMembers: FamilyMembers | null = null;
  let familyProfile: FamilyProfile | null = null;

  // ─── EDIT STATE ───────────────────────────────

  let isEditing = false;

  let editName = "";
  let editSurname = "";
  let editAvatar = {
    icon: "",
    icon_color: "",
    icon_bg: "",
  };

  const appVersion = "1.0.0";

  // ─── LOAD DATA ────────────────────────────────

  onMount(loadData);

  async function loadData() {
    loading = true;
    error = false;

    try {
      const [profile, members, family] = await Promise.all([
        getProfile(),
        getFamilyMembers(),
        getFamily(),
      ]);

      meUser = profile;
      familyMembers = members;
      familyProfile = family;
    } catch (e) {
      console.error(e);
      error = true;
    } finally {
      loading = false;
    }
  }

  // ─── EDIT LOGIC ───────────────────────────────

  function openEdit() {
    if (!meUser) return;

    editName = meUser.name;
    editSurname = meUser.surname;
    editAvatar = {
      icon: meUser.icon,
      icon_color: meUser.icon_color,
      icon_bg: meUser.icon_bg,
    };
    isEditing = true;
  }

  function cancelEdit() {
    if (!meUser) return;

    editName = meUser.name;
    isEditing = false;
  }

  async function saveEdit() {
    if (!meUser) return;

    console.log(editAvatar.icon);
    console.log(editAvatar.icon_color);
    console.log(editAvatar.icon_bg);

    meUser = await updateProfile({
      name: editName,
      surname: editSurname,
      icon: editAvatar.icon,
      icon_color: editAvatar.icon_color,
      icon_bg: editAvatar.icon_bg,
    });

    isEditing = false;
  }

  // ─── DERIVED ───────────────────────────────────

  $: fullName = meUser ? `${meUser.name} ${meUser.surname}` : "";
</script>

<div class="screen">
  {#if loading}
    <div class="state-msg">Загрузка...</div>
  {:else if error}
    <div class="state-msg">
      Ошибка загрузки
      <button on:click={loadData}>Повторить</button>
    </div>
  {:else}
    <!-- ───────── PROFILE ───────── -->

    {#if isEditing}
      <Block padding={10}>
        <div class="edit-avatar-wrap">
          <!-- <UserAvatar user={meUser} size={100} /> -->
          <AvatarConstructor
            initialIcon={editAvatar.icon}
            initialIconColor={editAvatar.icon_color}
            initialBg={editAvatar.icon_bg}
            on:change={(e) => {
              const { icon, icon_color, icon_bg } = e.detail;

              editAvatar = {
                icon,
                icon_color,
                icon_bg,
              };
            }}
            on:cancel={() => (isEditing = false)}
          />
        </div>

        <div class="edit-fields">
          <div class="field">
            <label class="field-label">Имя</label>
            <input class="field-input" bind:value={editName} />
          </div>

          <div class="field">
            <label class="field-label">Фамилия</label>
            <input class="field-input" bind:value={editSurname} />
          </div>
        </div>

        <div class="edit-actions">
          <button class="btn-cancel" on:click={cancelEdit}>Отмена</button>
          <button class="btn-save" on:click={saveEdit}>Сохранить</button>
        </div>
      </Block>
    {:else}
      <Block padding={10}>
        <div class="profile-header">
          <div class="avatar-wrap">
            <UserAvatar user={meUser} size={100} />
            <button class="edit-icon-btn" on:click={openEdit}>
              <Icon
                icon="material-symbols:edit-square"
                width="18"
                height="18"
                color="white"
              />
            </button>
          </div>
        </div>

        <div class="profile-info">
          <div class="profile-name">{fullName}</div>
        </div>
      </Block>
    {/if}

    <!-- ───────── FAMILY ───────── -->

    <div class="section-label">Семья</div>

    <Block>
      <div class="row clickable">
        <UserAvatar user={familyProfile} size={40} />

        <div class="row-text">
          <div class="row-title">{familyProfile?.name}</div>
          <div class="row-sub">
            {familyMembers?.members?.length ?? 0} участников
          </div>
        </div>
      </div>

      <div class="divider" />

      {#each familyMembers?.members ?? [] as member (member.id)}
        <div class="row clickable">
          <UserAvatar user={member} size={30} />

          <div class="row-text">
            <div class="row-title">
              {member.name}
              {#if member.id === meUser?.id}
                <span class="you-badge">(Вы)</span>
              {/if}
            </div>
          </div>

          <span class="arrow">›</span>
        </div>
      {/each}

      <div class="divider" />

      <div class="row clickable invite-row">
        <div class="invite-icon">+</div>

        <div class="row-text">
          <div class="row-title invite-title">Пригласить участника</div>
        </div>

        <span class="arrow invite-arrow">›</span>
      </div>
    </Block>

    <!-- ───────── SETTINGS ───────── -->
    <div class="section-label">Настройки</div>

    <Block>
      <div class="row clickable">
        <div class="row-icon muted">
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
        </div>

        <div class="row-text"><div class="row-title">Язык</div></div>
        <div class="row-right">Русский</div>
        <span class="arrow">›</span>
      </div>

      <div class="row clickable">
        <div class="row-icon muted">
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </div>

        <div class="row-text"><div class="row-title">Тема</div></div>
        <div class="row-right">Тёмная</div>
        <span class="arrow">›</span>
      </div>

      <div class="row">
        <div class="row-icon">
          <Icon
            icon="material-symbols:calendar-month-rounded"
            width="24"
            height="24"
          />
        </div>

        <div class="row-text"><div class="row-title">Версия</div></div>
        <ToggleSwitch checked={notificationsEnabled} on:change={handleClick} />
      </div>

      <div class="row">
        <div class="row-icon">
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>

        <div class="row-text"><div class="row-title">Версия</div></div>
        <div class="row-right">{appVersion}</div>
      </div>
    </Block>

    <!-- ───────── ACCOUNT ───────── -->

    <div class="section-label">Аккаунт</div>

    <Block>
      <div class="row clickable danger-row">
        <div class="row-text">
          <div class="row-title danger-title">Покинуть семью</div>
        </div>
      </div>

      <div class="divider" />

      <div class="row clickable danger-row">
        <div class="row-text">
          <div class="row-title danger-title">Выйти из аккаунта</div>
        </div>
      </div>
    </Block>
  {/if}
</div>

<style>
  .screen {
    background: var(--bg, #2a2318);
    min-height: 100vh;
    padding: 15px 15px 48px;
    font-family: system-ui, sans-serif;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--text-muted, rgba(255, 255, 255, 0.35));
    margin: 16px 16px 6px;
  }

  /* ── Profile card ────────────────────────────── */

  .profile-header {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
  }

  .avatar-wrap {
    position: relative;
    display: inline-block;
  }

  .edit-icon-btn {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: var(--accent, #e8a87c);
    /* border: 2.5px solid var(--bg-card, #332a1e); */
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: transform 0.2s;
  }

  .edit-icon-btn:active {
    transform: scale(0.9);
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .profile-name {
    font-size: 22px;
    font-weight: 800;
    color: var(--text-primary, #fff);
    margin-bottom: 2px;
  }

  /* ── Row ────────────────────────────── */
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
  }

  .clickable {
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .clickable:active {
    opacity: 0.65;
  }

  .row-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--bg, #2a2318);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent, #e8a87c);
    flex-shrink: 0;
  }

  .row-icon.muted {
    color: rgba(255, 255, 255, 0.4);
  }

  .row-text {
    flex: 1;
    min-width: 0;
  }

  .row-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .row-sub {
    font-size: 12px;
    color: var(--text-muted, rgba(255, 255, 255, 0.4));
    margin-top: 1px;
  }

  .row-right {
    font-size: 13px;
    color: var(--text-muted, rgba(255, 255, 255, 0.4));
    flex-shrink: 0;
  }

  .arrow {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }

  .you-badge {
    color: rgba(255, 255, 255, 0.35);
    font-weight: 400;
  }

  /* ── Invite row ────────────────────────────── */
  .invite-row {
    background: rgba(232, 168, 124, 0.08);
  }

  .invite-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(232, 168, 124, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    color: var(--accent, #e8a87c);
    flex-shrink: 0;
  }

  .invite-title {
    color: var(--accent, #e8a87c) !important;
  }

  .invite-arrow {
    color: var(--accent, #e8a87c) !important;
    opacity: 0.6;
  }

  /* ── Divider ────────────────────────────── */
  .divider {
    height: 0.5px;
    background: rgba(255, 255, 255, 0.06);
    margin: 0 14px;
  }

  .edit-avatar-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;
  }

  .edit-fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 0 4px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--text-muted, rgba(255, 255, 255, 0.35));
  }

  .field-input {
    background: var(--bg, #2a2318);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 11px 14px;
    color: var(--text-primary, #fff);
    font-size: 15px;
    font-family: inherit;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .field-input:focus {
    border-color: var(--accent, #e8a87c);
  }

  .field-input::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  .edit-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .btn-cancel {
    flex: 1;
    padding: 13px;
    background: var(--bg, #2a2318);
    border: none;
    border-radius: 14px;
    color: rgba(255, 255, 255, 0.5);
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
    background: var(--accent, #e8a87c);
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
</style>
