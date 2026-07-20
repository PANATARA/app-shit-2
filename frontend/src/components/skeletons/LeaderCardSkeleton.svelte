<div class="leader-card">
    <div class="lb-head">
        <div class="skeleton title"></div>
        <div class="skeleton date"></div>
    </div>

    <div class="leader-list">
        {#each Array(3) as _}
            <div class="leader-row">
                <div class="skeleton rank"></div>

                <div class="skeleton avatar"></div>

                <div class="leader-info">
                    <div class="skeleton name"></div>

                    <div class="skeleton sub"></div>
                </div>

                <div class="score-wrap">
                    <div class="skeleton score"></div>

                    <div class="skeleton score-label"></div>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .leader-card {
        display: flex;
        flex-direction: column;
    }

    /* ---------- HEADER ---------- */

    .lb-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

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

    .title {
        width: 130px;
        height: 14px;
        border-radius: 6px;
    }

    .date {
        width: 70px;
        height: 12px;
        border-radius: 6px;
    }

    /* ---------- LIST ---------- */

    .leader-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .leader-row {
        display: flex;
        align-items: center;
        gap: 12px;

        padding: 10px 14px;

        border-radius: 18px;

        background: var(--surface-alt);
    }

    /* ---------- ELEMENTS ---------- */

    .rank {
        width: 20px;
        height: 14px;

        border-radius: 5px;
    }

    .avatar {
        width: 40px;
        height: 40px;

        border-radius: 50%;
    }

    .leader-info {
        flex: 1;

        display: flex;
        flex-direction: column;

        gap: 6px;
    }

    .name {
        width: 110px;
        height: 14px;

        border-radius: 6px;
    }

    .sub {
        width: 90px;
        height: 11px;

        border-radius: 5px;
    }

    .score-wrap {
        display: flex;
        flex-direction: column;

        align-items: flex-end;

        gap: 5px;
    }

    .score {
        width: 35px;
        height: 20px;

        border-radius: 6px;
    }

    .score-label {
        width: 35px;
        height: 10px;

        border-radius: 5px;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }

        100% {
            background-position: -200% 0;
        }
    }
</style>
