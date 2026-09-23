<script lang="ts">
    export let slotsCount = 3;
</script>

<div class="planner-skeleton">
    {#each Array(slotsCount) as _}
        <div class="slot-card-skeleton">
            <div class="slot-head">
                <div class="shimmer badge-skeleton"></div>
                <div class="shimmer add-btn-skeleton"></div>
            </div>
            <div class="meal-item-skeleton">
                <div class="shimmer check-circle"></div>
                <div class="meal-content">
                    <div class="shimmer meal-title"></div>
                    <div class="shimmer meal-meta"></div>
                </div>
            </div>
        </div>
    {/each}
</div>

<style>
    .planner-skeleton {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }

    .slot-card-skeleton {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 14px 16px;
        border-radius: var(--radius-card, 22px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
    }

    .slot-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .badge-skeleton {
        width: 100px;
        height: 28px;
        border-radius: 999px;
    }

    .add-btn-skeleton {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }

    .meal-item-skeleton {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 14px;
        background: var(--surface-alt);
    }

    .check-circle {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .meal-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .meal-title {
        height: 14px;
        width: 55%;
        border-radius: 4px;
    }

    .meal-meta {
        height: 10px;
        width: 35%;
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
