<script lang="ts">
  import Block from "$ui/block.svelte";
  import HeatGraph from "$features/stats/HeatGraph.svelte";
  import { t } from "$lib/i18n.js";
  import { onMount } from "svelte";
  import { getFamily, getFamilyMembers } from "$api/family";
  import { getProfile } from "$api/me";
  import type { FamilyMembers, UserProfile, FamilyProfile } from "$types/index";
  import AsyncStateView from "$ui/AsyncStateView.svelte";
  import UserAvatar from "$ui/UserAvatar.svelte";
  import Icon from "@iconify/svelte";

  // ─── STATE MACHINE ─────────────────────────────
  let loading = true;
  let error = false;

  let meUser: UserProfile | null = null;
  let familyMembers: FamilyMembers | null = null;
  let familyProfile: FamilyProfile | null = null;

  function initials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  onMount(() => {
    loadData();
  });

  // ─── Data fetching ───────────────────────────────────────────────────────────

  async function loadData() {
    loading = true;
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
      console.error("Failed to load planned chores:", e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="screen">
  <!-- FAMILY CARD -->
  <AsyncStateView
    {loading}
    {error}
    errorMessage="Не удалось загрузить дела"
    onRetry={loadData}
    shimmerCount={5}
  >
    <Block>
      <div class="family-card">
        <div class="top">
          <div class="family-avatar-wrapper">
            <UserAvatar user={familyProfile} size={64} />
          </div>

          <div class="info">
            <div class="family-tag">Семейный круг</div>
            <p class="family-name">
              {familyProfile.name}
            </p>
          </div>

          <!-- <div class="avatar-stack">
            <div class="stack-avatar accent">A</div>
            <div class="stack-avatar success">M</div>
            <div class="stack-avatar neutral">J</div>
          </div> -->
        </div>

        <!-- stats -->
        <div class="stats">
          <div class="stat">
            <div class="stat-header">
              <Icon
                icon="material-symbols:trophy-rounded"
                width="32"
                height="32"
                color="yellow"
              />
              <span class="trend-badge positive">Рекорд</span>
            </div>
            <span class="value"> 248 </span>
            <p class="label">{$t.homeScreen.familyCard.choresTotalСompleted}</p>
          </div>

          <div class="stat">
            <div class="stat-header">
              <span class="stat-icon">⚡</span>
              <span class="trend-badge active">В топе</span>
            </div>
            <span class="value"> 90 </span>
            <p class="label">{$t.homeScreen.familyCard.choresWeekСompleted}</p>
          </div>
        </div>
      </div>
    </Block>

    <!-- LEADERBOARD -->
    <Block>
      <div class="leader-card">
        <div class="leader-title-container">
          <span class="leader-title">{$t.homeScreen.leadersCard.title}</span>
        </div>

        <div class="leader-list">
          <!-- Rank 1 -->
          <div class="leader-row rank-1">
            <div class="avatar gold-bg">A</div>
            <div class="leader-info">
              <div class="name">Alex</div>
              <div class="sub">Лидер недели</div>
            </div>
            <div class="score">128</div>
          </div>

          <!-- Rank 2 -->
          <div class="leader-row rank-2">
            <div class="avatar silver-bg">M</div>
            <div class="leader-info">
              <div class="name">Maria</div>
              <div class="sub">Активный участник</div>
            </div>
            <div class="score">102</div>
          </div>

          <!-- Rank 3 -->
          <div class="leader-row rank-3">
            <div class="avatar bronze-bg">J</div>
            <div class="leader-info">
              <div class="name">John</div>
              <div class="sub">Уверенный шаг</div>
            </div>
            <div class="score">87</div>
          </div>
        </div>
      </div>
    </Block>

    <!-- HEATMAP -->
    <Block title="Карта активности" padding={16}>
      <div class="heatmap-section">
        <div class="heatmap-wrapper-inner">
          <HeatGraph
            data={[]}
            dailyGoal={5}
            fake={true}
            theme="var(--accent)"
          />
        </div>

        <div class="heatmap-legend">
          <span class="legend-text">Меньше</span>
          <div class="legend-cells">
            <div class="legend-cell level-0"></div>
            <div class="legend-cell level-1"></div>
            <div class="legend-cell level-2"></div>
            <div class="legend-cell level-3"></div>
            <div class="legend-cell level-4"></div>
          </div>
          <span class="legend-text">Больше</span>
        </div>
      </div>
    </Block>
  </AsyncStateView>
</div>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 12px;
    min-height: 100vh;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  /* ── FAMILY CARD ───────────────────────────── */

  .family-card {
    display: flex;
    padding: 16px;
    flex-direction: column;
    gap: 18px;
  }

  .top {
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
  }

  .family-avatar-wrapper {
    position: relative;
    display: inline-block;
  }

  .family-avatar {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-soft), var(--surface-alt));
    color: var(--accent);
    border: 1px solid var(--border);
    font-size: 20px;
    font-weight: 800;
    flex-shrink: 0;
    box-shadow: inset 0 0 12px rgba(213, 138, 114, 0.1);
  }

  .pulse-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    background-color: var(--success);
    border: 2px solid var(--surface);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(143, 175, 154, 0.7);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(143, 175, 154, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(143, 175, 154, 0);
    }
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .family-tag {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--accent);
  }

  .family-name {
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
    margin: 0;
  }

  /* AVATAR STACK */
  .avatar-stack {
    display: flex;
    align-items: center;
    padding-left: 10px;
  }

  .stack-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--surface);
    margin-left: -8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--text);
    transition: transform 0.2s ease;
  }

  .stack-avatar:hover {
    transform: translateY(-4px);
    z-index: 10;
  }

  .stack-avatar.accent {
    background: var(--accent);
    color: var(--bg);
  }

  .stack-avatar.success {
    background: var(--success);
    color: var(--bg);
  }

  .stack-avatar.neutral {
    background: var(--surface-alt);
    border-color: var(--border);
    color: var(--text-secondary);
  }

  /* ── STATS ───────────────────────────── */

  .stats {
    display: flex;
    gap: 12px;
  }

  .stat {
    flex: 1;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .stat:hover {
    transform: translateY(-2px);
    border-color: var(--accent);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }

  .stat-icon {
    font-size: 16px;
  }

  .trend-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 8px;
  }

  .trend-badge.positive {
    background: var(--success-soft);
    color: var(--success);
  }

  .trend-badge.active {
    background: var(--accent-soft);
    color: var(--accent);
  }

  .value {
    font-size: 24px;
    font-weight: 800;
    color: var(--text);
  }

  .label {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  /* ── LEADERBOARD ───────────────────────────── */

  .leader-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .leader-title-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .leader-icon {
    font-size: 16px;
  }

  .leader-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .leader-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ROW */
  .leader-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 16px;
    background: var(--surface-alt);
    border: 1px solid transparent;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .leader-row:hover {
    transform: scale(1.01);
    background: var(--surface-alt);
    border-color: var(--border);
  }

  /* 🥇 Gold */
  .leader-row.rank-1 {
    background: linear-gradient(
      95deg,
      var(--surface-alt) 0%,
      rgba(255, 224, 130, 0.25) 50%,
      rgba(255, 193, 7, 0.12) 100%
    );
    border: 1px solid rgba(255, 193, 7, 0.25);
  }

  /* 🥈 Silver */
  .leader-row.rank-2 {
    background: linear-gradient(
      95deg,
      var(--surface-alt) 0%,
      rgba(224, 224, 224, 0.25) 50%,
      rgba(189, 189, 189, 0.12) 100%
    );
    border: 1px solid rgba(158, 158, 158, 0.25);
  }

  /* 🥉 Bronze */
  .leader-row.rank-3 {
    background: linear-gradient(
      95deg,
      var(--surface-alt) 0%,
      rgba(188, 140, 96, 0.22) 50%,
      rgba(141, 110, 99, 0.12) 100%
    );
    border: 1px solid rgba(141, 110, 99, 0.25);
  }

  .leader-row.rank-1:hover {
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(213, 138, 114, 0.1);
  }

  /* RANK BADGE */
  .rank-badge {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
  }

  .rank-badge.gold {
    background: #ffd700;
    color: #4d3d00;
  }

  .rank-badge.silver {
    background: #c0c0c0;
    color: #333;
  }

  .rank-badge.bronze {
    background: #cd7f32;
    color: #fff;
  }

  /* AVATARS */
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--bg);
  }

  .avatar.gold-bg {
    background: var(--accent);
  }

  .avatar.silver-bg {
    background: var(--success);
  }

  .avatar.bronze-bg {
    background: var(--text-secondary);
  }

  /* TEXT */
  .leader-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
  }

  .sub {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .score {
    font-size: 20px;
    font-weight: 800;
    color: #ffffff95;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .fire-icon {
    animation: bounce 1.2s infinite ease-in-out alternate;
  }

  @keyframes bounce {
    from {
      transform: translateY(0) scale(1);
    }
    to {
      transform: translateY(-2px) scale(1.1);
    }
  }

  /* ── HEATMAP SECTION ───────────────────────── */
  .heatmap-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .heatmap-wrapper-inner {
    overflow-x: auto;
    padding: 4px 0;
  }

  .heatmap-legend {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
  }

  .legend-text {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .legend-cells {
    display: flex;
    gap: 3px;
  }

  .legend-cell {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  /* Support color mixing for adaptive themes */
  .legend-cell.level-0 {
    background: #202020;
    border: 1px solid var(--border);
    box-sizing: border-box;
  }

  .legend-cell.level-1 {
    background: color-mix(in srgb, var(--accent) 25%, #202020);
  }

  .legend-cell.level-2 {
    background: color-mix(in srgb, var(--accent) 50%, #202020);
  }

  .legend-cell.level-3 {
    background: color-mix(in srgb, var(--accent) 75%, #202020);
  }

  .legend-cell.level-4 {
    background: var(--accent);
  }
</style>
