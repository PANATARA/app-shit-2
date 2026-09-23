<script lang="ts">
    export let count = 4;
</script>

<div class="recipes-grid">
    {#each Array(count) as _}
        <div class="skeleton-recipe-card">
            <div class="shimmer thumb-skeleton"></div>
            <div class="content-skeleton">
                <div class="shimmer title-line"></div>
                <div class="meta-row">
                    <div class="shimmer meta-line"></div>
                    <div class="shimmer meta-line"></div>
                </div>
            </div>
        </div>
    {/each}
</div>

<style>
    .recipes-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        width: 100%;
    }

    .skeleton-recipe-card {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-card, 22px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
        overflow: hidden;
    }

    .thumb-skeleton {
        height: 100px;
        width: 100%;
    }

    .content-skeleton {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .title-line {
        height: 14px;
        width: 75%;
        border-radius: 4px;
    }

    .meta-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 2px;
    }

    .meta-line {
        height: 11px;
        width: 40px;
        border-radius: 4px;
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
