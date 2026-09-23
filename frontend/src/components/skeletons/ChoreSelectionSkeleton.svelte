<script lang="ts">
    export let count = 3;
</script>

<div class="skeleton-grid">
    {#each Array(count) as _}
        <div class="chore-select-card">
            <div class="shimmer icon-box"></div>
            <div class="info-lines">
                <div class="shimmer title-line"></div>
                <div class="shimmer desc-line"></div>
            </div>
            <div class="shimmer checkbox-box"></div>
        </div>
    {/each}
</div>

<style>
    .skeleton-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }

    .chore-select-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 18px;
        background: var(--surface);
        border: 1px solid var(--border-subtle);
    }

    .icon-box {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        flex-shrink: 0;
    }

    .info-lines {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .title-line {
        height: 14px;
        width: 60%;
        border-radius: 4px;
    }

    .desc-line {
        height: 10px;
        width: 40%;
        border-radius: 4px;
    }

    .checkbox-box {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        flex-shrink: 0;
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
