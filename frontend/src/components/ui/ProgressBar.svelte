<script lang="ts">
    import { fade } from "svelte/transition";

    export let totalCount;
    export let completedCount;
    export let progressPercentage;
    export let value;
</script>

<!-- Добавлена корневая обертка с вашим классом -->
<div class="progress-section">
    <div class="progress-info">
        <span class="progress-title">{value}</span>
        {#if totalCount > 0}
            <span class="progress-ratio"
                >{completedCount} из {totalCount} выполнено</span
            >
        {:else}
            <span class="progress-ratio">Задач нет</span>
        {/if}
    </div>
    {#if totalCount > 0}
        <div class="progress-bar-bg" transition:fade={{ duration: 300 }}>
            <div
                class="progress-bar-fill"
                style="width: {progressPercentage}%"
            ></div>
        </div>
    {/if}
</div>

<style>
    .progress-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 4px;
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .progress-title {
        font-size: 20px;
        font-weight: 800;
        color: var(--text-primary);
        text-transform: capitalize;
    }

    .progress-ratio {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        background: var(--surface);
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid var(--border);
    }

    .progress-bar-bg {
        height: 8px;
        background: var(--surface-alt);
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid var(--border);
    }

    .progress-bar-fill {
        height: 100%;
        background: linear-gradient(
            90deg,
            var(--accent) 0%,
            var(--success) 100%
        );
        border-radius: 4px;
        transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
</style>
