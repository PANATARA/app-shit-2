<script lang="ts">
    import UserAvatar from "$ui/UserAvatar.svelte";
    import UserProfileSkeleton from "$skeletons/CompactUserProfile.svelte";
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
        gap: 4px;
        min-width: 0;
    }

    .name {
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.3px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 1.2;
    }

    /* Notification - 44x44pt Touch Target */
    .notification-btn {
        min-width: 44px;
        min-height: 44px;
        border-radius: 14px;
        background: var(--surface-alt);
        border: 0.5px solid var(--border-subtle);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        transition: transform 0.14s cubic-bezier(0.25, 1, 0.5, 1), background 0.16s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .notification-btn:active {
        transform: scale(0.94) translateZ(0);
    }

    .unread-dot {
        position: absolute;
        top: 11px;
        right: 11px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 6px var(--accent-glow);
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
        border-radius: 16px;
        background: var(--surface-alt);
        border: 0.5px solid var(--border-subtle);
        min-width: 0;
        box-sizing: border-box;
        transition: transform 0.14s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.16s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .stat-box:active {
        transform: scale(0.97) translateZ(0);
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
