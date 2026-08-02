<script lang="ts">
    import Icon from "@iconify/svelte";

    export let name = "Andrey";
    export let avatar = "";
    export let unread = false;
    export let onNotificationClick = () => {};

    // Фейковые данные — потом заменишь на реальные
    export let level = 12;
    export let xp = 340;
    export let xpToNext = 500;

    $: xpPercent = Math.round((xp / xpToNext) * 100);
</script>

<div class="container">
    <div class="top-row">
        <!-- User -->
        <div class="user">
            <div class="avatar placeholder">
                {name.charAt(0).toUpperCase()}
            </div>
            <div class="user-info">
                <span class="name">{name}</span>
                <span class="level-badge">Lvl {level}</span>
            </div>
        </div>

        <!-- Notification -->
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
    </div>

    <!-- XP Bar -->
    <div class="xp-row">
        <div class="xp-bar-track">
            <div class="xp-bar-fill" style="width: {xpPercent}%"></div>
        </div>
        <span class="xp-label">{xp} / {xpToNext} XP</span>
    </div>
</div>

<style>
    .container {
        background: var(--surface);
        padding: 12px;
        border-radius: 24px;
        /*border: 1px so/lid var(--border);*/
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        width: 100%;
    }

    .user {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
    }

    .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 16px;
        font-weight: 700;
    }

    .name {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .level-badge {
        font-size: 11px;
        font-weight: 700;
        color: var(--accent);
        letter-spacing: 0.4px;
    }

    /* ── XP BAR ──────────────────────────────────── */
    .xp-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .xp-bar-track {
        flex: 1;
        height: 5px;
        background: var(--accent-soft);
        border-radius: 99px;
        overflow: hidden;
    }

    .xp-bar-fill {
        height: 100%;
        background: var(--accent);
        border-radius: 99px;
        transition: width 0.4s ease;
    }

    .xp-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        white-space: nowrap;
        flex-shrink: 0;
    }

    /* ── NOTIFICATION ────────────────────────────── */
    .notification {
        position: relative;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 50%;
        background: var(--surface);
        color: var(--text-primary);
        cursor: pointer;
        transition:
            transform 0.15s ease,
            background 0.2s ease;
        flex-shrink: 0;
    }

    .notification:active {
        transform: scale(0.92);
    }

    .notification:hover {
        background: var(--surface-hover);
    }

    .dot {
        position: absolute;
        top: 8px;
        right: 9px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent);
        border: 2px solid var(--surface);
    }
</style>
