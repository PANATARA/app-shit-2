<script lang="ts">
    export let count = 4;
</script>

<div class="skeleton-list">
    {#each Array(count) as _}
        <div class="skeleton-chore-item">
            <div class="shimmer icon-box"></div>
            <div class="info-lines">
                <div class="shimmer line title-line"></div>
                <div class="shimmer line desc-line"></div>
            </div>
            <div class="shimmer arrow-box"></div>
        </div>
    {/each}
</div>

<style>
    .skeleton-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }

    .skeleton-chore-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        border-radius: 20px;
        background: var(--surface);
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .icon-box {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        flex-shrink: 0;
    }

    .info-lines {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .line {
        border-radius: 4px;
    }

    .title-line {
        height: 14px;
        width: 55%;
    }

    .desc-line {
        height: 11px;
        width: 35%;
    }

    .arrow-box {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        flex-shrink: 0;
        opacity: 0.5;
    }

    .shimmer {
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
