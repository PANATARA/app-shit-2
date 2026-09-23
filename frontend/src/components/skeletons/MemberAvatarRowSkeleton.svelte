<script lang="ts">
    export let count = 3;
</script>

<div class="members-skeleton-row">
    {#each Array(count) as _}
        <div class="member-skeleton-item">
            <div class="shimmer avatar-circle"></div>
            <div class="shimmer name-line"></div>
        </div>
    {/each}
</div>

<style>
    .members-skeleton-row {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .member-skeleton-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }

    .avatar-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
    }

    .name-line {
        width: 40px;
        height: 10px;
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
