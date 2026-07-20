<div class="family-card">
    <!-- Header -->
    <div class="header">
        <div class="skeleton avatar"></div>

        <div class="header-info">
            <div class="skeleton tag"></div>

            <div class="skeleton name"></div>

            <div class="skeleton members"></div>
        </div>
    </div>

    <!-- Main stat -->
    <div class="hero-stat">
        <div class="skeleton hero-label"></div>

        <div class="skeleton hero-value"></div>

        <div class="skeleton hero-sub"></div>
    </div>

    <!-- Mini stats -->
    <div class="stats-grid">
        {#each Array(3) as _}
            <div class="mini-card">
                <div class="skeleton icon"></div>

                <div class="skeleton mini-value"></div>

                <div class="skeleton mini-label"></div>
            </div>
        {/each}
    </div>
</div>

<style>
    .family-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    /* ---------- SHIMMER ---------- */

    .skeleton {
        background: linear-gradient(
            90deg,
            var(--surface-alt) 25%,
            var(--border) 50%,
            var(--surface-alt) 75%
        );

        background-size: 200% 100%;

        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        from {
            background-position: 200% 0;
        }

        to {
            background-position: -200% 0;
        }
    }

    /* ---------- HEADER ---------- */

    .header {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .avatar {
        width: 64px;
        height: 64px;

        border-radius: 18px;

        flex-shrink: 0;
    }

    .header-info {
        flex: 1;

        display: flex;
        flex-direction: column;

        gap: 6px;
    }

    .tag {
        width: 90px;
        height: 11px;

        border-radius: 5px;
    }

    .name {
        width: 150px;
        height: 26px;

        border-radius: 8px;
    }

    .members {
        width: 110px;
        height: 14px;

        border-radius: 6px;
    }

    /* ---------- HERO ---------- */

    .hero-stat {
        background: var(--surface-alt);
        border-radius: 16px;

        padding: 14px 16px;

        border: 1px solid var(--border);
    }

    .hero-label {
        width: 140px;
        height: 16px;

        border-radius: 6px;
    }

    .hero-value {
        width: 120px;
        height: 36px;

        border-radius: 8px;

        margin-top: 8px;
    }

    .hero-sub {
        width: 90px;
        height: 12px;

        border-radius: 5px;

        margin-top: 8px;
    }

    /* ---------- MINI CARDS ---------- */

    .stats-grid {
        display: grid;

        grid-template-columns: repeat(3, 1fr);

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

        gap: 8px;
    }

    .icon {
        width: 22px;
        height: 22px;

        border-radius: 6px;
    }

    .mini-value {
        width: 45px;
        height: 22px;

        border-radius: 6px;
    }

    .mini-label {
        width: 55px;
        height: 11px;

        border-radius: 5px;
    }
</style>
