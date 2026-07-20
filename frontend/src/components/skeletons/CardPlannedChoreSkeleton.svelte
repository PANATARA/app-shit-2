<script lang="ts">
    export let count = 2;
</script>

<div class="shimmer-wrapper">
    {#each Array(count) as _}
        <div class="shimmer-card">
            <div class="shimmer-circle"></div>

            <div class="shimmer-lines">
                <div class="shimmer-line title-line"></div>
                <div class="shimmer-line desc-line"></div>
            </div>
        </div>
    {/each}
</div>

<style>
    .shimmer-wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .shimmer-card {
        display: flex;
        align-items: center;
        gap: 16px;

        padding: 16px;

        background: var(--surface);

        border: 1px solid var(--border);

        border-radius: 20px;

        overflow: hidden;
        position: relative;
    }

    .shimmer-circle {
        width: 48px;
        height: 48px;

        border-radius: 16px;

        flex-shrink: 0;

        background: linear-gradient(
            90deg,
            var(--surface-alt) 25%,
            var(--border) 50%,
            var(--surface-alt) 75%
        );

        background-size: 200% 100%;

        animation: shimmer 1.5s infinite;
    }

    .shimmer-lines {
        flex: 1;

        display: flex;
        flex-direction: column;

        gap: 8px;
    }

    .shimmer-line {
        height: 12px;

        border-radius: 4px;

        background: linear-gradient(
            90deg,
            var(--surface-alt) 25%,
            var(--border) 50%,
            var(--surface-alt) 75%
        );

        background-size: 200% 100%;

        animation: shimmer 1.5s infinite;
    }

    .title-line {
        width: 50%;
        height: 14px;
    }

    .desc-line {
        width: 35%;
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
