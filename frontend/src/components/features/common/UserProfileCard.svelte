<script lang="ts">
    import UserAvatar from "$ui/UserAvatar.svelte";
    import Icon from "@iconify/svelte";
    import type { UserProfileStats } from "$types/index";
    import UserProfileSkeleton from "$skeletons/UserProfileSkeleton.svelte";

    export let user: UserProfileStats;
    export let loading = true;
</script>

<div class="content">
    <!-- ── Аватар и имя ── -->
    {#if loading}
        <UserProfileSkeleton />
    {:else}
        <div class="profile-header">
            <UserAvatar {user} size={72} />
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

        <div class="hero-stat">
            <div class="hero-label">
                <Icon icon="material-symbols:emoji-events-rounded" width="16" height="16" />
                Всего выполнено
            </div>
            <div style="margin-left: auto; text-align: right;">
                <div class="hero-value">{user.total_completed}</div>
                <div class="hero-subtitles">домашних дел</div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="mini-card">
                <Icon
                    icon="material-symbols:bolt-rounded"
                    width="22"
                    height="22"
                />

                <div class="mini-value">{user.week_completed}</div>
                <div class="mini-label">за неделю</div>
            </div>

            <div class="mini-card">
                <Icon
                    icon="material-symbols:local-fire-department-rounded"
                    width="22"
                    height="22"
                />

                <div class="mini-value">{user.streak}</div>
                <div class="mini-label">дней подряд</div>
            </div>

            <div class="mini-card">
                <Icon
                    icon="material-symbols:auto-awesome-rounded"
                    width="22"
                    height="22"
                />

                <div class="mini-value">{user.experience}</div>
                <div class="mini-label">опыт семьи</div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* ── Profile header ───────────────────────── */
    .profile-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 0 2px;
    }

    .profile-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
    }

    .profile-name {
        font-size: 17px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.2;
    }

    .profile-username {
        font-size: 12px;
        color: var(--text-muted);
    }

    .level-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: rgba(232, 168, 124, 0.15);
        color: var(--accent, #e8a87c);
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 20px;
        align-self: flex-start;
        margin-top: 2px;
    }

    /* ── Exp card ───────────────────────── */
    .exp-card {
        background: var(--bg-card);
        border-radius: 14px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
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
        font-size: 10px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .exp-level-num {
        font-size: 24px;
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
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .exp-divider {
        font-size: 12px;
        color: var(--text-muted);
    }

    .exp-max {
        font-size: 12px;
        color: var(--text-muted);
    }

    /* ── Progress ───────────────────────── */
    .progress-track {
        height: 6px;
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

    /* ── Hero stat ───────────────────────── */
    .hero-stat {
        background: var(--surface-alt);
        border-radius: 12px;
        padding: 10px 14px;
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .hero-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        color: var(--accent);
        flex-shrink: 0;
    }

    .hero-value {
        font-size: 24px;
        font-weight: 900;
        line-height: 1;
        color: var(--text-primary);
    }

    .hero-subtitles {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 0;
    }

    /* ── Stats grid ───────────────────────── */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .mini-card {
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 10px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        text-align: center;
    }

    .mini-card :global(svg) {
        color: var(--accent);
        width: 18px;
        height: 18px;
    }

    .mini-value {
        font-size: 18px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
    }

    .mini-label {
        font-size: 10px;
        color: var(--text-muted);
        line-height: 1.2;
    }
</style>
