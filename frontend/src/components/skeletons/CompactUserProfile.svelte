<div class="container">
    <div class="top-row">
        <!-- Avatar -->
        <div class="user">
            <div class="avatar skeleton"></div>

            <div class="user-info">
                <div class="name skeleton"></div>
                <div class="level skeleton"></div>
            </div>
        </div>

        <!-- Notification -->
        <div class="notification skeleton"></div>
    </div>

    <!-- XP -->
    <div class="xp-row">
        <div class="xp-label">
            <div class="text skeleton"></div>
            <div class="text small skeleton"></div>
        </div>

        <div class="progress-track skeleton"></div>
    </div>
</div>


<style>
    .container {
        position: relative;
        overflow: hidden;

        display: flex;
        flex-direction: column;
        gap: 18px;

        padding: 18px;

        border-radius: 24px;

        background: var(--surface);

        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px rgba(255, 255, 255, 0.04);
    }

    .top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        gap: 14px;
    }


    /* User */

    .user {
        display: flex;
        align-items: center;

        gap: 14px;
    }

    .user-info {
        display: flex;
        flex-direction: column;

        gap: 8px;
    }

    .avatar {
        width: 52px;
        height: 52px;

        border-radius: 50%;
    }

    .name {
        width: 120px;
        height: 18px;

        border-radius: 8px;
    }

    .level {
        width: 85px;
        height: 18px;

        border-radius: 999px;
    }


    /* Notification */

    .notification {
        width: 48px;
        height: 48px;

        border-radius: 16px;
    }


    /* XP */

    .xp-row {
        display: flex;
        flex-direction: column;

        gap: 8px;
    }

    .xp-label {
        display: flex;
        justify-content: space-between;

        align-items: center;
    }

    .text {
        width: 45px;
        height: 14px;

        border-radius: 6px;
    }

    .text.small {
        width: 90px;
    }

    .progress-track {
        height: 10px;

        border-radius: 999px;
    }


    /* Skeleton animation */

    .skeleton {
        position: relative;

        overflow: hidden;

        background:
            color-mix(
                in srgb,
                var(--text-secondary) 15%,
                transparent
            );
    }

    .skeleton::after {
        content: "";

        position: absolute;

        inset: 0;

        background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.12),
            transparent
        );

        animation: shimmer 1.8s infinite;
    }


    @keyframes shimmer {
        from {
            transform: translateX(-100%);
        }

        to {
            transform: translateX(100%);
        }
    }
</style>
