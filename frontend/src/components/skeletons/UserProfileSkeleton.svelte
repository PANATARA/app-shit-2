<div class="profile-header">
    <div class="skeleton avatar"></div>

    <div class="profile-info">
        <div class="skeleton name"></div>
        <div class="skeleton username"></div>
        <div class="skeleton badge"></div>
    </div>
</div>

<div class="exp-card">
    <div class="exp-header">
        <div class="exp-level-wrap">
            <div class="skeleton level-label"></div>
            <div class="skeleton level"></div>
        </div>

        <div class="exp-numbers">
            <div class="skeleton current"></div>
            <div class="skeleton divider"></div>
            <div class="skeleton max"></div>
        </div>
    </div>

    <div class="skeleton progress"></div>
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

    /* ---------- Card ---------- */

    .exp-card {
        background: var(--bg-card);
        border-radius: 18px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .exp-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .exp-level-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .level-label {
        width: 56px;
        height: 10px;
        border-radius: 4px;
    }

    .level {
        width: 42px;
        height: 34px;
        border-radius: 8px;
    }

    .exp-numbers {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .current {
        width: 48px;
        height: 16px;
        border-radius: 6px;
    }

    .divider {
        width: 8px;
        height: 12px;
        border-radius: 4px;
    }

    .max {
        width: 48px;
        height: 14px;
        border-radius: 6px;
    }

    .progress {
        width: 100%;
        height: 8px;
        border-radius: 4px;
    }
</style>
