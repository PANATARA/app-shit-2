<script lang="ts">
    import type { WeeklyLeadersResponse } from "$types/index";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import { userSession } from "$api/client";
    import LeaderCardSkeleton from "$skeletons/LeaderCardSkeleton.svelte";

    export let loading = true;
    export let weekLeaders: WeeklyLeadersResponse | null = null;
</script>

{#if loading}
    <LeaderCardSkeleton/>
{:else}
<div class="leader-card">
    <div class="lb-head">
        <span class="lb-title">Лидеры недели</span>
        <span class="lb-subtitle">13–19 июл</span>
    </div>

    <div class="leader-list">
        {#each weekLeaders.leaders as leader, i}
            <div
                class="leader-row"
                class:rank-1={i === 0}
                class:rank-2={i === 1}
                class:rank-3={i === 2}
                class:is-me={leader.member.id === $userSession.userId}
            >
                <span class="rank rank-{i + 1}">{i + 1}</span>
                <UserAvatar user={leader.member} size={40} />
                <div class="leader-info">
                    <div class="name">
                        {leader.member.name}
                        {#if leader.member.id === $userSession.userId}<span
                                class="you-tag">Вы</span
                            >{/if}
                    </div>
                    <div class="sub" class:sub-gold={i === 0}>
                        просто молодец
                    </div>
                </div>
                <div class="score-wrap">
                    <div class="score" class:score-gold={i === 0}>
                        {leader.chore_completion_count}
                    </div>
                    <div class="score-label">задач</div>
                </div>
            </div>
        {/each}
    </div>
</div>
{/if}



<style>
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

    .leader-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .lb-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .lb-title {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: var(--text-muted);
    }

    .lb-subtitle {
        font-size: 12px;
        color: var(--text-muted);
    }

    .leader-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 18px;
        background: var(--surface-alt);
        border: 1px solid transparent;

        transition:
            transform 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease;
    }

    .leader-row:active {
        transform: scale(0.98);
    }

    .leader-row.rank-1 {
        background: linear-gradient(
            120deg,
            #2a1e0a 0%,
            #3a2a10 60%,
            #2e2210 100%
        );
        border-color: rgba(255, 200, 60, 0.3);
    }

    .leader-row.rank-2 {
        border-color: rgba(180, 180, 200, 0.18);
    }
    .leader-row.rank-3 {
        border-color: rgba(180, 120, 60, 0.18);
    }

    .rank {
        font-size: 13px;
        font-weight: 800;
        min-width: 22px;
        text-align: center;
        color: var(--text-muted);
    }

    .rank-1 {
        color: #ffd84d;
    }
    .rank-2 {
        color: #c0c0d0;
    }
    .rank-3 {
        color: #cd8b4a;
    }

    .leader-info {
        flex: 1;
        min-width: 0;
    }

    .name {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .you-tag {
        font-size: 10px;
        font-weight: 600;
        background: rgba(232, 168, 124, 0.2);
        color: var(--accent);
        border-radius: 6px;
        padding: 2px 7px;
    }

    .sub {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 2px;
    }

    .sub-gold {
        color: #ffd84d;
    }

    .score-wrap {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 1px;
    }

    .score {
        font-size: 18px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
    }

    .score-gold {
        color: #ffd84d;
    }

    .score-label {
        font-size: 10px;
        color: var(--text-muted);
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
</style>
