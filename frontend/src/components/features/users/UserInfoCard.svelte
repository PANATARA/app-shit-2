<script lang="ts">
    import UserAvatar from "$ui/UserAvatar.svelte";
    import UserProfileSkeleton from "$skeletons/CompactUserProfile.svelte";
    import ProgressBar from "$ui/ProgressBar.svelte";
    import Card from "$ui/Card.svelte";
    import Icon from "@iconify/svelte";
    import { t } from "$lib/i18n";
    import type { UserProfileStats } from "$types/index";

    export let user: UserProfileStats | null = null;
    export let loading = true;
    export let unread: boolean = false;
    export let onNotificationClick: (() => void) | null = null;
</script>

{#if loading || !user}
    <UserProfileSkeleton />
{:else}
    <Card glowDirection="top-right">
        <!-- Profile Header -->
        <div class="top-row">
            <div class="user">
                <div class="avatar-wrap">
                    <UserAvatar {user} size={52} />
                </div>
                <div class="user-info">
                    <span class="name">{user.name}</span>
                    <span class="level-badge">
                        <Icon icon="material-symbols:award-star-rounded" width={14} height={14} />
                        {$t.stats.level} {user.level}
                    </span>
                </div>
            </div>

            {#if onNotificationClick}
                <button
                    class="notification-btn"
                    on:click={onNotificationClick}
                    aria-label="Notifications"
                >
                    <Icon icon="material-symbols:notifications-outline-rounded" width={22} height={22} />
                    {#if unread}
                        <span class="unread-dot"></span>
                    {/if}
                </button>
            {/if}
        </div>

        <!-- XP Progress -->
        <div class="xp-row">
            <ProgressBar
                percent={user.progress_percent}
                label={$t.stats.xp}
                sublabel="{user.experience} / {user.exp_to_next_total} XP"
                shimmer={true}
            />
        </div>

        <!-- Unified Stats: Total & Weekly Completed -->
        <div class="stats-row">
            <div class="stat-box">
                <div class="stat-top">
                    <div class="stat-icon-wrap total">
                        <Icon icon="material-symbols:task-alt-rounded" width={18} height={18} />
                    </div>
                    <span class="stat-value">{user.total_completed ?? 0}</span>
                </div>
                <span class="stat-label">{$t.stats.totalCompleted || "Всего выполнено"}</span>
            </div>

            <div class="stat-box">
                <div class="stat-top">
                    <div class="stat-icon-wrap week">
                        <Icon icon="material-symbols:bolt-rounded" width={18} height={18} />
                    </div>
                    <span class="stat-value">{user.week_completed ?? 0}</span>
                </div>
                <span class="stat-label">{$t.stats.thisWeek || "На этой неделе"}</span>
            </div>
        </div>
    </Card>
{/if}

<style>
    .top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        position: relative;
        z-index: 1;
    }

    .user {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
    }

    .avatar-wrap {
        border-radius: 50%;
        padding: 2px;
        background: color-mix(in srgb, var(--accent) 24%, transparent);
        box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 16%, transparent);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
    }

    .name {
        font-size: 19px;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.3px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 1.2;
    }

    .level-badge {
        width: fit-content;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 9px 3px 7px;
        border-radius: var(--radius-pill, 999px);
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2px;
    }

    /* Notification */
    .notification-btn {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .notification-btn:active {
        transform: scale(0.92);
    }

    .unread-dot {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 6px var(--accent-glow);
    }

    /* XP */
    .xp-row {
        position: relative;
        z-index: 1;
        padding-top: 2px;
    }

    /* Dual Stats Section */
    .stats-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        width: 100%;
        box-sizing: border-box;
        position: relative;
        z-index: 1;
        margin-top: 4px;
    }

    .stat-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        padding: 12px 14px;
        border-radius: var(--radius-card, 18px);
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        min-width: 0;
        box-sizing: border-box;
        transition: transform 0.16s ease, border-color 0.2s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .stat-box:active {
        transform: scale(0.98);
    }

    .stat-top {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .stat-icon-wrap {
        width: 28px;
        height: 28px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .stat-icon-wrap.total {
        background: var(--success-soft);
        color: var(--success);
    }

    .stat-icon-wrap.week {
        background: var(--accent-soft);
        color: var(--accent);
    }

    .stat-value {
        font-size: 22px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
        letter-spacing: -0.4px;
    }

    .stat-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        line-height: 1.3;
    }
</style>
