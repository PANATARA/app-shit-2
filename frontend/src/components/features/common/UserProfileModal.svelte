<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import BottomSheet from "$ui/BottomSheet.svelte";
  import UserAvatar from "$ui/UserAvatar.svelte";
  import Icon from "@iconify/svelte";
  import { getUserProfile } from "$api/me";
  import type { UserProfile } from "$types/index";
  import AsyncStateView from "$ui/AsyncStateView.svelte";

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

  .exp-total {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .exp-total strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* ── Stats row ───────────────────────── */
  .stats-row {
    display: flex;
    align-items: center;
    background: var(--bg-card);
    border-radius: 16px;
    padding: 14px 0;
  }

  .stat-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-num {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
    line-height: 1.3;
  }

  .stat-divider {
    width: 0.5px;
    height: 32px;
    background: var(--border, rgba(255, 255, 255, 0.08));
  }
</style>
