<script lang="ts">
    import type { WeeklyLeadersResponse } from "$types/index";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import { userSession } from "$api/client";
    import LeaderCardSkeleton from "$skeletons/LeaderCardSkeleton.svelte";
    import { openProfile } from "$lib/settings";

    export let loading = true;
    export let weekLeaders: WeeklyLeadersResponse | null = null;
</script>

{#if loading}
    <LeaderCardSkeleton />
{:else}
    <div class="leader-card">
        <div class="lb-head">
            <span class="lb-title">Лидеры недели</span>
            <span class="lb-subtitle">13–19 июл</span>
        </div>

        <div class="leader-list">
            {#each weekLeaders.leaders as leader, i}
                <button
                    class="leader-row"
                    class:rank-1={i === 0}
                    class:rank-2={i === 1}
                    class:rank-3={i === 2}
                    class:is-me={leader.member.id === $userSession.userId}
                    on:click={() => openProfile(leader.member.id)}
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
                    </div>
                    <div class="score-wrap">
                        <div class="score" class:score-gold={i === 0}>
                            {leader.chore_completion_count}
                        </div>
                        <div class="score-label">задач</div>
                    </div>
                </button>
            {/each}
        </div>
    </div>
{/if}

<style>
    /* ── STATS ─────────────────────────────────────────────────────────────── */

    .stats {
        display: flex;
        gap: 12px;
    }

    .stat {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 4px;

        padding: 14px;

        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 18px;

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
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;
    }

    .stat-icon {
        font-size: 16px;
    }

    .trend-badge {
        padding: 2px 6px;

        font-size: 10px;
        font-weight: 700;

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

    /* ── LEADERBOARD ───────────────────────────────────────────────────────── */

    .leader-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .lb-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
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

        background: var(--surface-alt);
        border: 1px solid transparent;
        border-radius: 18px;
    }

    .leader-row:active {
        transform: scale(0.98);
    }

    .leader-row.rank-1 {
        background: var(--accent-soft);
        border-color: color-mix(in srgb, var(--accent) 30%, transparent);
    }

    .leader-row.rank-2 {
        border-color: color-mix(
            in srgb,
            var(--text-secondary) 20%,
            transparent
        );
    }

    .leader-row.rank-3 {
        border-color: color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .rank {
        min-width: 22px;

        font-size: 13px;
        font-weight: 800;
        text-align: center;
        color: var(--text-muted);
    }

    .rank-1 {
        color: var(--accent);
    }

    .rank-2,
    .rank-3 {
        color: var(--text-secondary);
    }

    .leader-info {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
    }

    .name {
        display: flex;
        align-items: center;
        gap: 6px;

        font-size: 14px;
        font-weight: 700;
        color: var(--text);
    }

    .you-tag {
        padding: 2px 7px;

        font-size: 10px;
        font-weight: 600;

        background: var(--accent-soft);
        color: var(--accent);
        border-radius: 6px;
    }
    .score-wrap {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 1px;
    }

    .score {
        display: flex;
        align-items: center;
        gap: 4px;

        font-size: 20px;
        font-weight: 800;
        color: var(--text);
    }

    .score-gold {
        color: var(--accent);
    }

    .score-label {
        font-size: 10px;
        color: var(--text-muted);
    }

    /* ── AVATARS ───────────────────────────────────────────────────────────── */

    .avatar {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 36px;
        height: 36px;

        font-size: 14px;
        font-weight: 700;
        color: var(--bg);

        border-radius: 50%;
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
</style>
