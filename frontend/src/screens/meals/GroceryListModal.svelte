<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import BottomSheet from "$ui/BottomSheet.svelte";
    import Icon from "@iconify/svelte";
    import {
        useFamilyGroceries,
        addGroceryItem,
        toggleGroceryItem,
        removeGroceryItem,
        clearCompletedGrocery,
    } from "$lib/mealsStore";

    const dispatch = createEventDispatcher<{
        close: void;
    }>();

    let newItemText = "";
    let isAdding = false;

    const groceriesSWR = useFamilyGroceries();

    $: items = $groceriesSWR.data ?? [];
    $: unboughtCount = items.filter((i) => !i.checked).length;
    $: completedCount = items.filter((i) => i.checked).length;

    async function handleAddItem() {
        const text = newItemText.trim();
        if (!text || isAdding) return;

        isAdding = true;
        try {
            await addGroceryItem({ name: text });
            newItemText = "";
        } catch (e) {
            console.error("Failed to add grocery item", e);
        } finally {
            isAdding = false;
        }
    }
</script>

<BottomSheet title="Список покупок для семьи" on:close={() => dispatch("close")} flyY={999} flyDuration={280}>
    <div class="grocery-sheet">
        <!-- Quick Add Input -->
        <div class="add-row">
            <input
                type="text"
                class="grocery-input"
                placeholder="Добавить продукт (например, молоко, яйца)..."
                bind:value={newItemText}
                on:keydown={(e) => e.key === "Enter" && handleAddItem()}
            />
            <button class="add-btn" on:click={handleAddItem} disabled={!newItemText.trim()}>
                <Icon icon="material-symbols:add-rounded" width={22} height={22} />
            </button>
        </div>

        <!-- List Stats & Clear Action -->
        <div class="list-meta">
            <span class="meta-counter">Осталось купить: <strong>{unboughtCount}</strong></span>
            {#if completedCount > 0}
                <button class="clear-btn" on:click={clearCompletedGrocery}>
                    <Icon icon="material-symbols:delete-sweep-outline-rounded" width={16} height={16} />
                    <span>Убрать купленные ({completedCount})</span>
                </button>
            {/if}
        </div>

        <!-- Items List -->
        <div class="grocery-items">
            {#if items.length === 0}
                <div class="empty-state">
                    <div class="empty-icon">🛒</div>
                    <span class="empty-title">Список покупок пуст</span>
                    <span class="empty-desc">
                        Добавляйте недостающие ингредиенты из рецептов в один клик!
                    </span>
                </div>
            {:else}
                {#each items as item (item.id)}
                    <div class="grocery-item" class:checked={item.checked}>
                        <button
                            class="check-circle"
                            class:checked={item.checked}
                            on:click={() => toggleGroceryItem(item.id)}
                            aria-label="Отметить"
                        >
                            {#if item.checked}
                                <Icon icon="material-symbols:check-rounded" width={14} height={14} />
                            {/if}
                        </button>

                        <div
                            class="item-info"
                            on:click={() => toggleGroceryItem(item.id)}
                            on:keydown={(e) => e.key === "Enter" && toggleGroceryItem(item.id)}
                            role="button"
                            tabindex="0"
                        >
                            <span class="item-name" class:crossed={item.checked}>{item.name}</span>
                            {#if item.amount}
                                <span class="item-amount">{item.amount} {item.unit || ""}</span>
                            {/if}
                            {#if item.addedFromRecipe}
                                <span class="recipe-source">из: {item.addedFromRecipe}</span>
                            {/if}
                        </div>

                        <button
                            class="del-btn"
                            on:click={() => removeGroceryItem(item.id)}
                            aria-label="Удалить"
                        >
                            <Icon icon="material-symbols:close-rounded" width={16} height={16} />
                        </button>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</BottomSheet>

<style>
    .grocery-sheet {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 4px 16px 24px;
    }

    /* Add Row */
    .add-row {
        display: flex;
        gap: 8px;
    }

    .grocery-input {
        flex: 1;
        height: 46px;
        padding: 0 14px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;
    }

    .grocery-input:focus {
        border-color: var(--accent);
    }

    .add-btn {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: var(--accent);
        color: #ffffff;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.16s ease, opacity 0.2s ease;
    }

    .add-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .add-btn:active:not(:disabled) {
        transform: scale(0.92);
    }

    /* Meta */
    .list-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2px;
    }

    .meta-counter {
        font-size: 13px;
        color: var(--text-secondary);
    }

    .meta-counter strong {
        color: var(--text-primary);
        font-weight: 800;
    }

    .clear-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
    }

    /* Items */
    .grocery-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 420px;
        overflow-y: auto;
    }

    .grocery-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 16px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        transition: opacity 0.2s ease, background 0.2s ease;
    }

    .grocery-item.checked {
        opacity: 0.58;
        background: color-mix(in srgb, var(--surface-alt) 70%, transparent);
    }

    .check-circle {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--border);
        background: var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.16s ease;
    }

    .check-circle.checked {
        background: var(--success);
        border-color: var(--success);
    }

    .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        cursor: pointer;
    }

    .item-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .item-name.crossed {
        text-decoration: line-through;
        color: var(--text-muted);
    }

    .item-amount {
        font-size: 12px;
        font-weight: 700;
        color: var(--accent);
    }

    .recipe-source {
        font-size: 11px;
        color: var(--text-muted);
    }

    .del-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: transparent;
        border: none;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    /* Empty */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 36px 16px;
        text-align: center;
        gap: 8px;
    }

    .empty-icon {
        font-size: 40px;
        margin-bottom: 4px;
    }

    .empty-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .empty-desc {
        font-size: 13px;
        color: var(--text-muted);
        max-width: 260px;
        line-height: 1.4;
    }
</style>
