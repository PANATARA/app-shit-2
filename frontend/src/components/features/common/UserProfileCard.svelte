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
                <Icon
                    icon="material-symbols:emoji-events-rounded"
                    width="18"
                    height="18"
                />
                Всего выполнено
            </div>

            <div class="hero-value">{user.total_completed}</div>

            <div class="hero-subtitles">домашних дел</div>
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
    .hero-stat {
        background: var(--surface-alt);
        border-radius: 16px;
        padding: 14px 16px;
        border: 1px solid var(--border);
    }

    .hero-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;

        font-size: 13px;
        font-weight: 700;

        color: var(--accent);
    }

    .hero-value {
        margin-top: 4px;
        font-size: 32px; /* было 42 */
        font-weight: 900;
        line-height: 1;

        color: var(--text-primary);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        margin-top: 10px;
        gap: 10px;
    }

    .mini-card {
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 16px;

        padding: 14px 10px;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;

        text-align: center;
    }

    .mini-card :global(svg) {
        color: var(--accent);
    }

    .mini-value {
        font-size: 22px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
    }

    .mini-label {
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.2;
    }
</style>
