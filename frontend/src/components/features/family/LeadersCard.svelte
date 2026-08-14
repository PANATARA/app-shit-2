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
    .leader-card {
        position: relative;
        overflow: hidden;

        padding: 18px;

        border-radius: 24px;

        background:
            linear-gradient(
                180deg,
                color-mix(in srgb, var(--accent) 10%, var(--surface)),
                var(--surface)
            );

        box-shadow:
            0 10px 30px rgba(0,0,0,.08),
            inset 0 1px rgba(255,255,255,.04);
    }


    .leader-card::before {
        content: "";

        position: absolute;

        width: 160px;
        height: 160px;

        right: -60px;
        top: -70px;

        border-radius: 50%;

        background:
            color-mix(in srgb, var(--accent) 20%, transparent);

        filter: blur(20px);

        pointer-events: none;
    }


    /* HEADER */

    .lb-head {
        position: relative;
        z-index: 1;

        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-bottom: 16px;
    }


    .lb-title {
        font-size: 13px;
        font-weight: 800;

        letter-spacing: .8px;
        text-transform: uppercase;

        color: var(--text-primary);
    }


    .lb-subtitle {
        padding: 5px 10px;

        border-radius: 999px;

        background:
            rgba(255,255,255,.06);

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

        background:
            rgba(255,255,255,.035);

        transition:
            transform .18s ease,
            background .2s ease,
            box-shadow .2s ease;
    }


    .leader-row:active {
        transform: scale(.97);
    }


    /* CURRENT USER */

    .leader-row.is-me {
        background:
            color-mix(in srgb, var(--accent) 12%, transparent);

        box-shadow:
            0 0 0 1px
            color-mix(in srgb, var(--accent) 25%, transparent);
    }



    /* TOP THREE */

    .leader-row.rank-1 {

        background:
            linear-gradient(
                135deg,
                color-mix(in srgb, var(--accent) 20%, transparent),
                rgba(255,255,255,.04)
            );

        box-shadow:
            0 8px 24px
            color-mix(in srgb, var(--accent) 18%, transparent);
    }


    .leader-row.rank-2 {
        background:
            rgba(255,255,255,.055);
    }


    .leader-row.rank-3 {
        background:
            rgba(255,255,255,.045);
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

        background:
            rgba(255,255,255,.06);

        font-size: 13px;
        font-weight: 900;

        color: var(--text-muted);
    }


    .rank-1 {

        background:
            linear-gradient(
                135deg,
                #ffd76a,
                #ffb52e
            );

        color: #6b4300;

        box-shadow:
            0 5px 15px rgba(255,190,50,.35);
    }


    .rank-2 {
        background:
            rgba(200,200,200,.18);

        color:
            var(--text-primary);
    }


    .rank-3 {
        background:
            rgba(205,130,70,.18);

        color:
            #d88c50;
    }



    /* USER */

    .leader-info {
        flex: 1;

        min-width: 0;
    }


    .name {

        display:flex;
        align-items:center;

        gap:7px;

        font-size:15px;

        font-weight:800;

        color:var(--text-primary);

        overflow:hidden;
    }


    .you-tag {

        padding:3px 8px;

        border-radius:999px;

        background:
            color-mix(in srgb,var(--accent) 18%,transparent);

        color:var(--accent);

        font-size:10px;

        font-weight:700;
    }



    /* SCORE */


    .score-wrap {

        display:flex;
        flex-direction:column;

        align-items:flex-end;

    }


    .score {

        font-size:22px;

        line-height:1;

        font-weight:900;

        color:var(--text-primary);
    }


    .score-gold {

        color:var(--accent);

    }


    .score-label {

        margin-top:3px;

        font-size:10px;

        font-weight:600;

        color:var(--text-muted);
    }
</style>
