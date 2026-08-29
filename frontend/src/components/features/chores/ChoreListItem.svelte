<script lang="ts">
    import ChoreIcon from "$ui/ChoreIcon.svelte";
    import type { Chore } from "$types/index";

    export let chore: Chore;
    export let onClick: (chore: Chore) => void;
</script>

<button class="chore-item" onclick={() => onClick?.(chore)}>
    <ChoreIcon {chore} size={42} />

    <div class="chore-info">
        <span class="chore-name">{chore.name}</span>
        {#if chore.description}
            <span class="chore-desc">{chore.description}</span>
        {/if}
    </div>

    <span class="chore-valuation">🪙 {chore.valuation}</span>

    <svg
        class="arrow"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
    >
        <path d="M9 18l6-6-6-6" />
    </svg>
</button>

<style>
    .chore-item {
        display: flex;
        align-items: center;
        gap: 12px;

        width: 100%;

        padding: 12px 14px;

        border: none;
        border-radius: 20px;

        background: var(--surface);
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.05);

        color: var(--text-primary);
        font-family: inherit;
        font-size: 15px;
        text-align: left;

        cursor: pointer;

        transition:
            transform 0.15s ease,
            opacity 0.15s ease;
    }

    .chore-item:active {
        transform: scale(0.98);
        opacity: 0.8;
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

    .arrow {
        flex-shrink: 0;
        color: var(--text-muted);
        opacity: 0.5;
    }
</style>
