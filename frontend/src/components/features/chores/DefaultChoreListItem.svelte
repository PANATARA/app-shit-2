<script lang="ts">
    import Icon from "@iconify/svelte";
    import ChoreIcon from "$ui/ChoreIcon.svelte";
    import type { ChoreItem } from "$types/index";

    export let chore: ChoreItem;
    export let onAdd: () => void;
</script>

<div class="chore-wrapper">
    <div class="chore-item">
        <ChoreIcon {chore} size={42} />

        <div class="chore-info">
            <span class="chore-name">{chore.name}</span>
            {#if chore.description}
                <span class="chore-desc">{chore.description}</span>
            {/if}
        </div>

        <span class="chore-valuation">🪙 {chore.valuation}</span>
    </div>

    <button
        class="add-button"
        on:click|stopPropagation={onAdd}
        aria-label="Добавить задачу"
    >
        <Icon icon="material-symbols:add-rounded" width={24} height={24} />
    </button>
</div>

<style>
    .chore-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .chore-item {
        flex: 1;
        min-width: 0;

        display: flex;
        align-items: center;
        gap: 12px;

        padding: 12px 14px;

        border-radius: 20px;

        background: var(--surface);
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .chore-info {
        flex: 1;
        min-width: 0;

        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .chore-name {
        font-size: 15px;
        font-weight: 700;

        color: var(--text-primary);

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .chore-desc {
        font-size: 12px;
        font-weight: 500;

        color: var(--text-muted);

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .chore-valuation {
        flex-shrink: 0;

        font-size: 13px;
        font-weight: 700;

        color: var(--text-muted);
    }

    .add-button {
        width: 42px;
        height: 42px;

        flex-shrink: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        border: none;
        border-radius: 50%;

        background: var(--accent);
        color: white;

        cursor: pointer;

        transition:
            transform 0.15s ease,
            opacity 0.15s ease;
    }

    .add-button:active {
        transform: scale(0.9);
        opacity: 0.7;
    }
</style>
