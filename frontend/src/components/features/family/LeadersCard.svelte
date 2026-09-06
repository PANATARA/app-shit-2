<script lang="ts">
    import type { WeeklyLeadersResponse } from "$types/index";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import { userSession } from "$api/client";
    import LeaderCardSkeleton from "$skeletons/LeaderCardSkeleton.svelte";
    import { openProfile } from "$lib/settings";
    import { getCurrentWeekRange } from "$lib/utils";
    import Card from "$ui/Card.svelte";

    export let loading = true;
    export let weekLeaders: WeeklyLeadersResponse | null = null;

    const weekRange = getCurrentWeekRange();

    $: leaders = weekLeaders?.leaders ?? [];
</script>

{#if loading}
    <LeaderCardSkeleton />
{:else}
    <Card title="Лидеры недели" glowDirection="top-right">
        <span slot="action" class="lb-subtitle">{weekRange}</span>

        {#if !leaders.length}
            <div class="empty-state">
                <span class="empty-icon">🏆</span>
                <span class="empty-text">Пока никто не выполнил задачи</span>
                <span class="empty-sub">Будь первым на этой неделе</span>
            </div>
        {:else}
            <div class="leader-list">
                {#each leaders as leader, i (leader.member.id)}
                    <button
                        class="leader-row"
                        class:rank-1={i === 0}
                        class:rank-2={i === 1}
                        class:rank-3={i === 2}
                        class:is-me={leader.member.id === $userSession.userId}
                        onclick={() => openProfile(leader.member.id)}
                        aria-label="Открыть профиль {leader.member.name}"
                    >
                        <span
                            class="rank"
                            class:rank-medal-1={i === 0}
                            class:rank-medal-2={i === 1}
                            class:rank-medal-3={i === 2}
                        >
                            {i + 1}
                        </span>
                        <UserAvatar user={leader.member} size={40} />
                        <div class="leader-info">
                            <div class="name">
                                <span class="name-text"
                                    >{leader.member.name}</span
                                >
                                {#if leader.member.id === $userSession.userId}
                                    <span class="you-tag">Вы</span>
                                {/if}
                            </div>
                        </div>
                        <div class="score-wrap">
                            <span class="score" class:score-gold={i === 0}>
                                {leader.chore_completion_count}
                            </span>
                            <span class="score-label">задач</span>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </Card>
{/if}

<style>
    .lb-subtitle {
        padding: 5px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
    }

    /* LIST */

    .leader-list {
        position: relative;
        z-index: 1;

        display: flex;
        flex-direction: column;

        gap: 10px;
    }

    .leader-row {
        position: relative;

        display: flex;
        align-items: center;

        gap: 12px;

        width: 100%;

        padding: 12px;

        border: none;

        border-radius: 20px;

        background: rgba(255, 255, 255, 0.035);

        cursor: pointer;

        transition:
            transform 0.18s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
    }

    .leader-row:active {
        transform: scale(0.97);
    }

    /* CURRENT USER */

    .leader-row.is-me {
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent);
    }

    /* TOP THREE */

    .leader-row.rank-1 {
        background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--accent) 20%, transparent),
            rgba(255, 255, 255, 0.04)
        );
        box-shadow: 0 8px 24px
            color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .leader-row.rank-2 {
        background: rgba(255, 255, 255, 0.055);
    }

    .leader-row.rank-3 {
        background: rgba(255, 255, 255, 0.045);
    }

    /* RANK MEDALS */

    .rank {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 30px;
        height: 30px;

        flex-shrink: 0;

        border-radius: 50%;

        background: rgba(255, 255, 255, 0.06);

        font-size: 13px;
        font-weight: 900;

        color: var(--text-muted);
    }

    .rank-medal-1 {
        background: linear-gradient(135deg, #ffd76a, #ffb52e);
        color: #6b4300;
        box-shadow: 0 5px 15px rgba(255, 190, 50, 0.35);
    }

    .rank-medal-2 {
        background: rgba(200, 200, 200, 0.18);
        color: var(--text-primary);
    }

    .rank-medal-3 {
        background: rgba(205, 130, 70, 0.18);
        color: #d88c50;
    }

    /* USER INFO */

    .leader-info {
        flex: 1;
        min-width: 0;
    }

    .name {
        display: flex;
        align-items: center;

        gap: 7px;

        overflow: hidden;
    }

    .name-text {
        font-size: 15px;
        font-weight: 800;

        color: var(--text-primary);

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .you-tag {
        flex-shrink: 0;

        padding: 3px 8px;

        border-radius: 999px;

        background: color-mix(in srgb, var(--accent) 18%, transparent);

        color: var(--accent);

        font-size: 10px;
        font-weight: 700;
    }

    /* SCORE */

    .score-wrap {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        flex-shrink: 0;
    }

    .score {
        font-size: 22px;
        line-height: 1;
        font-weight: 900;

        color: var(--text-primary);
    }

    .score-gold {
        color: var(--accent);
    }

    .score-label {
        margin-top: 3px;

        font-size: 10px;
        font-weight: 600;

        color: var(--text-muted);
    }

    /* EMPTY */

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;

        padding: 24px 16px;
        gap: 6px;
    }

    .empty-icon {
        font-size: 36px;
        margin-bottom: 4px;
        filter: grayscale(0.3);
    }

    .empty-text {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .empty-sub {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-muted);
    }
</style>
