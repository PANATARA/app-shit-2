<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import BottomSheet from "$ui/BottomSheet.svelte";
  import UserAvatar from "$ui/UserAvatar.svelte";
  import Icon from "@iconify/svelte";
  import { getUserProfile } from "$api/me";
  import { kickFamilyMember, changeFamilyAdmin } from "$api/family";
  import type { UserProfile } from "$types/index";
  import AsyncStateView from "$ui/AsyncStateView.svelte";
  import { userSession } from "$api/client";

  const dispatch = createEventDispatcher();

  export let userId: string;
  let user: UserProfile;
  let loading = true;
  let error = false;

  onMount(loadData);

  async function loadData() {
    loading = true;
    error = false;

    try {
      user = await getUserProfile(userId);
    } catch (e) {
      console.error(e);
      error = true;
    } finally {
      loading = false;
    }
  }

  function close() {
    dispatch("close");
  }
  async function handleKickMember() {
    try {
      await kickFamilyMember(userId);

      // закрываем профиль после успешного удаления
      dispatch("close");

      // можно отправить событие родителю для обновления списка
      dispatch("updated");
    } catch (e) {
      console.error("Ошибка при исключении пользователя:", e);
    }
  }

  async function handleChangeAdmin() {
    try {
      await changeFamilyAdmin(userId);

      dispatch("updated");

      // закрываем профиль
      dispatch("close");
    } catch (e) {
      console.error("Ошибка при смене администратора:", e);
    }
  }
</script>

<BottomSheet title="" on:close={close} flyY={999} flyDuration={320}>
  <AsyncStateView
    {loading}
    {error}
    errorMessage="Не удалось загрузить профиль"
    onRetry={loadData}
    shimmerCount={5}
  >
    <div class="content">
      <!-- ── Аватар и имя ── -->
      <div class="profile-header">
        <UserAvatar {user} size={90} />
        <div class="profile-info">
          <div class="profile-name">{user.name} {user.surname}</div>
          <div class="profile-username">@{user.username}</div>
          <div class="level-badge">
            <Icon
              icon="material-symbols:military-tech-rounded"
              width="14"
              height="14"
            />
            Новичок
          </div>
        </div>
      </div>

      <!-- ── Уровень и опыт ── -->
      <div class="exp-card">
        <div class="exp-header">
          <div class="exp-level-wrap">
            <span class="exp-level-label">Уровень</span>
            <span class="exp-level-num">{user.level}</span>
          </div>
          <div class="exp-numbers">
            <span class="exp-current">{user.experience}</span>
            <span class="exp-divider">/</span>
            <span class="exp-max">{user.exp_to_next_total}</span>
          </div>
        </div>

        <div class="progress-track">
          <div
            class="progress-fill"
            style="width: {user.progress_percent}%"
          ></div>
        </div>
        {#if $userSession.isFamilyAdmin && $userSession.userId != user.id}
          <div class="actions-card">
            <button class="action-btn primary" on:click={handleChangeAdmin}>
              Сделать главой семьи
            </button>

            <button class="action-btn danger" on:click={handleKickMember}>
              Исключить из семейного круга
            </button>
          </div>
        {/if}
      </div>
    </div>
  </AsyncStateView>
</BottomSheet>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px 16px 8px;
  }

  /* ── Profile header ───────────────────────── */
  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 0 4px;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .profile-username {
    font-size: 13px;
    color: var(--text-muted);
  }

  .level-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(232, 168, 124, 0.15);
    color: var(--accent, #e8a87c);
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    align-self: flex-start;
    margin-top: 2px;
  }

  /* ── Exp card ───────────────────────── */
  .exp-card {
    background: var(--bg-card);
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .exp-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .exp-level-wrap {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .exp-level-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .exp-level-num {
    font-size: 32px;
    font-weight: 800;
    color: var(--accent, #e8a87c);
    line-height: 1;
  }

  .exp-numbers {
    display: flex;
    align-items: baseline;
    gap: 3px;
  }

  .exp-current {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .exp-divider {
    font-size: 13px;
    color: var(--text-muted);
  }

  .exp-max {
    font-size: 13px;
    color: var(--text-muted);
  }

  /* ── Progress ───────────────────────── */
  .progress-track {
    height: 8px;
    background: var(--bg, #2a2318);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent, #e8a87c), #f0c090);
    border-radius: 4px;
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    min-width: 4px;
  }
  /* ── Actions ───────────────────────── */

  .actions-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
    padding-bottom: 8px;
  }

  .action-btn {
    width: 100%;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    border: none;
    border-radius: 14px;

    font-size: 15px;
    font-weight: 700;

    cursor: pointer;
    transition:
      transform 0.15s ease,
      opacity 0.15s ease;
  }

  .action-btn:active {
    transform: scale(0.97);
  }

  .action-btn.primary {
    background: var(--accent-soft);
    color: var(--text-primary);
  }

  .action-btn.danger {
    background: rgba(220, 80, 80, 0.08);
    color: #d65a5a;
  }
</style>
