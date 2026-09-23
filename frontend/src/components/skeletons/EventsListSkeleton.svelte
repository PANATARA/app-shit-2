<script lang="ts">
    export let count = 4;
</script>

<div class="skeleton-list">
    {#each Array(count) as _}
        <div class="event-card skeleton-card">
            <div class="shimmer icon-skeleton"></div>
            <div class="event-body">
                <div class="shimmer name-skeleton"></div>
                <div class="shimmer desc-skeleton"></div>
            </div>
            <div class="shimmer badge-skeleton"></div>
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

    .event-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 20px;
        box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05));
    }

    .event-body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .icon-skeleton {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        flex-shrink: 0;
    }

    .name-skeleton {
        width: 140px;
        height: 16px;
        border-radius: 6px;
    }

    .desc-skeleton {
        width: 90px;
        height: 12px;
        border-radius: 4px;
    }

    .badge-skeleton {
        width: 60px;
        height: 22px;
        border-radius: 999px;
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
        from {
            background-position: 200% 0;
        }
        to {
            background-position: -200% 0;
        }
    }
</style>
