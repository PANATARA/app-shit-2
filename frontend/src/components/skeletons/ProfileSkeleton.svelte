<div class="profile-skeleton">
    <div class="profile-header">
        <div class="skeleton avatar"></div>
    </div>

    <div class="profile-info">
        <div class="skeleton name"></div>
    </div>
</div>

<style>
    .profile-skeleton {
        display: flex;
        flex-direction: column;
        align-items: center;

        padding: 10px;
    }

    /* место аватара */
    .profile-header {
        display: flex;
        justify-content: center;

        margin-bottom: 14px;
    }

    .avatar {
        width: 100px;
        height: 100px;

        border-radius: 50%;
    }

    /* имя */
    .profile-info {
        display: flex;
        justify-content: center;

        width: 100%;
    }

    .name {
        width: 140px;
        height: 18px;

        border-radius: 8px;
    }

    /* shimmer */

    .skeleton {
        background: linear-gradient(
            90deg,
            var(--surface-alt),
            var(--border),
            var(--surface-alt)
        );

        background-size: 200% 100%;

        animation: shimmer 1.4s infinite;
    }

    @keyframes shimmer {
        from {
            background-position: 200% 0;
        }

        to {
            background-position: -200% 0;
        }
    }
</style>
