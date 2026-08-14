<script lang="ts">
    import Icon from "@iconify/svelte";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import ProgressBar from "$ui/ProgressBar.svelte";
    import type { UserProfileStats } from "$types/index";
    import UserProfileSkeleton from "$skeletons/CompactUserProfile.svelte";

    export let user: UserProfileStats;
    export let onNotificationClick = () => {};
    export let showNotificationButton = false;
    export let unread = false;
    export let loading = true;
</script>

{#if loading}
    <UserProfileSkeleton />
{:else}
    <div class="container">
        <div class="top-row">
            <!-- User -->
            <div class="user">
                <UserAvatar {user} size={52} />
                <div class="user-info">
                    <span class="name">{user.name}</span>
                    <span class="level-badge">Уровень {user.level}</span>
                </div>
            </div>

            <!-- Notification -->
            {#if showNotificationButton}
                <button
                    class="notification"
                    class:active={unread}
                    on:click={onNotificationClick}
                >
                    <Icon
                        icon="material-symbols:notifications-rounded"
                        width="22"
                        height="22"
                    />
                    {#if unread}
                        <span class="dot"></span>
                    {/if}
                </button>
            {/if}
        </div>

        <!-- XP Bar -->
        <ProgressBar
            title="Опыт"
            subtitle={`${user.experience} / ${user.exp_to_next_total} XP`}
            value={user.experience}
            max={user.exp_to_next_total}
            gradient="linear-gradient(90deg,#ffb84d,#ffd36b)"
        />
    </div>
{/if}

<style>
    .container {
        position: relative;
        overflow: hidden;

        display: flex;
        flex-direction: column;
        gap: 18px;

        padding: 18px;

        border-radius: 24px;

        background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--accent) 10%, var(--surface)),
            var(--surface)
        );

        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px rgba(255, 255, 255, 0.04);
    }

    .container::before {
        content: "";

        position: absolute;

        right: -70px;
        top: -70px;

        width: 180px;
        height: 180px;

        border-radius: 50%;

        background: color-mix(in srgb, var(--accent) 18%, transparent);

        filter: blur(16px);

        pointer-events: none;
    }

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

    .user-info {
        display: flex;
        flex-direction: column;
        gap: 6px;

        min-width: 0;
    }

    .name {
        font-size: 18px;
        font-weight: 800;

        color: var(--text-primary);

        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .level-badge {
        width: fit-content;

        padding: 4px 10px;

        border-radius: 999px;

        background: color-mix(in srgb, var(--accent) 14%, transparent);

        color: var(--accent);

        font-size: 11px;
        font-weight: 700;

        letter-spacing: 0.3px;
    }

    /* Notification */

    .notification {
        position: relative;

        width: 48px;
        height: 48px;

        border: none;
        border-radius: 16px;

        display: flex;
        align-items: center;
        justify-content: center;

        background: rgba(255, 255, 255, 0.06);

        color: var(--text-primary);

        backdrop-filter: blur(10px);

        transition:
            transform 0.18s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
    }

    .notification:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .notification:active {
        transform: scale(0.92);
    }

    .notification.active {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
    }

    .notification :global(svg) {
        width: 22px;
        height: 22px;
    }

    .dot {
        position: absolute;

        top: 10px;
        right: 10px;

        width: 9px;
        height: 9px;

        border-radius: 50%;

        background: #ff5b5b;

        border: 2px solid var(--surface);

        box-shadow: 0 0 10px rgba(255, 91, 91, 0.5);
    }
</style>
