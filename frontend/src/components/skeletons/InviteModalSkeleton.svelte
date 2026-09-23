<div class="shimmer-wrap">
    <div class="shimmer-code"></div>
    <div class="shimmer-line"></div>
</div>

<style>
    .shimmer-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 32px 0 16px;
        width: 100%;
    }

    .shimmer-code {
        width: 220px;
        height: 52px;
        border-radius: 16px;
        background: linear-gradient(
            90deg,
            var(--surface-alt) 25%,
            var(--border) 50%,
            var(--surface-alt) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }

    .shimmer-line {
        width: 160px;
        height: 14px;
        border-radius: 7px;
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
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }
</style>
