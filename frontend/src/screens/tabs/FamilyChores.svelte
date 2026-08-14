<script lang="ts">
    import Icon from "@iconify/svelte";

    import { detailPlannedChoreParams, activeTab } from "$lib/navigation";

    function handleBack() {
        activeTab.set("boardScreen");
    }
</script>

<div class="page">
    <header class="page-header">
        <button class="back-btn" on:click={handleBack}>
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width="18"
                height="18"
            />
            Назад
        </button>

        <h1>{plannedChore?.chore.name}</h1>

        <div class="header-spacer"></div>
    </header>
</div>

<style>
    .page {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        background: var(--bg);
        padding-top: env(safe-area-inset-top);
    }

    .page-header {
        height: 56px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 4px;
        flex-shrink: 0;
    }

    .page-header h1 {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        white-space: nowrap;
    }

    .back-btn {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 8px 12px;
        background: none;
        border: none;
        color: var(--accent);
        font-size: 15px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        border-radius: 10px;
        z-index: 1;
    }

    .back-btn:active {
        opacity: 0.6;
    }

    .header-spacer {
        width: 80px;
    }
</style>
