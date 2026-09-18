<div class="profile-header">
    <div class="skeleton avatar"></div>

    <div class="profile-info">
        <div class="skeleton name"></div>
        <div class="skeleton username"></div>
        <div class="skeleton badge"></div>
    </div>
</div>

<style>
    /* ---------- Общие ---------- */

    .skeleton {
        background: linear-gradient(
            90deg,
            var(--surface-alt) 25%,
            var(--border) 50%,
            var(--surface-alt) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s linear infinite;
    }

    @keyframes shimmer {
        from {
            background-position: 200% 0;
        }

        to {
            background-position: -200% 0;
        }
    }

    /* ---------- Header ---------- */

    .profile-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 0 16px;
    }

    .avatar {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .profile-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
    }

    .name {
        width: 170px;
        max-width: 75%;
        height: 22px;
        border-radius: 8px;
    }

    .username {
        width: 110px;
        height: 14px;
        border-radius: 6px;
    }

    .badge {
        width: 85px;
        height: 24px;
        border-radius: 999px;
    }
</style>
