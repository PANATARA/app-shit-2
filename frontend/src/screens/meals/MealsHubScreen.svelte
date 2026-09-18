<script lang="ts">
    import Icon from "@iconify/svelte";
    import WeeklyMealPlanner from "./WeeklyMealPlanner.svelte";
    import FamilyRecipeBox from "./FamilyRecipeBox.svelte";
    import RecipeDetailModal from "./RecipeDetailModal.svelte";
    import AddMealModal from "./AddMealModal.svelte";
    import GroceryListModal from "./GroceryListModal.svelte";
    import { type Recipe, type MealSlot, useFamilyGroceries } from "$lib/mealsStore";

    let activeSegment: "planner" | "recipes" = "planner";
    let plannerRef: any = null;

    // Modal states
    let detailRecipe: Recipe | null = null;
    let addMealData: { date: string; slot: MealSlot } | null = null;
    let showGrocery = false;

    // Toast state
    let toastMessage = "";
    let toastTimer: any = null;

    function triggerToast(msg: string) {
        toastMessage = msg;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastMessage = "";
        }, 2800);
    }

    const groceriesSWR = useFamilyGroceries();
    $: groceryItems = $groceriesSWR.data ?? [];
    $: groceryCount = groceryItems.filter((i) => !i.checked).length;
</script>

<div class="meals-hub">
    <!-- Top Bar -->
    <header class="hub-header">
        <div class="hub-title-row">
            <div class="title-wrap">
                <h1 class="hub-title">Питание и меню</h1>
                <span class="hub-subtitle">Семейные трапезы и рецепты</span>
            </div>

            <!-- Grocery List Trigger -->
            <button class="grocery-pill-btn" on:click={() => (showGrocery = true)} aria-label="Список покупок">
                <Icon icon="material-symbols:shopping-cart-outline-rounded" width={18} height={18} />
                {#if groceryCount > 0}
                    <span class="grocery-badge">{groceryCount}</span>
                {/if}
            </button>
        </div>

        <!-- Apple HIG Segmented Control -->
        <div class="segmented-control" role="tablist">
            <button
                class="segment-btn"
                class:active={activeSegment === "planner"}
                on:click={() => (activeSegment = "planner")}
                role="tab"
                aria-selected={activeSegment === "planner"}
            >
                <Icon icon="material-symbols:calendar-today-rounded" width={16} height={16} />
                <span>План на неделю</span>
            </button>
            <button
                class="segment-btn"
                class:active={activeSegment === "recipes"}
                on:click={() => (activeSegment = "recipes")}
                role="tab"
                aria-selected={activeSegment === "recipes"}
            >
                <Icon icon="material-symbols:menu-book-rounded" width={16} height={16} />
                <span>Книга рецептов</span>
            </button>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="hub-content">
        {#if activeSegment === "planner"}
            <WeeklyMealPlanner
                bind:this={plannerRef}
                on:addMeal={(e) => (addMealData = e.detail)}
                on:openRecipe={(e) => (detailRecipe = e.detail)}
            />
        {:else}
            <FamilyRecipeBox
                on:selectRecipe={(e) => (detailRecipe = e.detail)}
            />
        {/if}
    </main>

    <!-- Floating Toast Notification -->
    {#if toastMessage}
        <div class="toast-popup">
            <Icon icon="material-symbols:check-circle-rounded" width={18} height={18} style="color: var(--success)" />
            <span>{toastMessage}</span>
        </div>
    {/if}

    <!-- Modals -->
    {#if detailRecipe}
        <RecipeDetailModal
            recipe={detailRecipe}
            on:close={() => (detailRecipe = null)}
            on:toast={(e) => triggerToast(e.detail)}
            on:scheduled={async (e) => {
                activeSegment = "planner";
                if (e.detail?.date) {
                    plannerRef?.setDateString?.(e.detail.date);
                }
                if (e.detail?.meal) {
                    plannerRef?.addOptimisticMeal?.(e.detail.meal);
                }
                await plannerRef?.revalidate?.();
            }}
        />
    {/if}

    {#if addMealData}
        <AddMealModal
            targetDate={addMealData.date}
            defaultSlot={addMealData.slot}
            on:close={() => (addMealData = null)}
            on:added={async (e) => {
                triggerToast("Блюдо успешно добавлено в план!");
                if (e.detail) {
                    plannerRef?.addOptimisticMeal?.(e.detail);
                }
                await plannerRef?.revalidate?.();
            }}
        />
    {/if}

    {#if showGrocery}
        <GroceryListModal on:close={() => (showGrocery = false)} />
    {/if}
</div>

<style>
    .meals-hub {
        display: flex;
        flex-direction: column;
        min-height: 100%;
        padding: 12px 14px 24px;
        box-sizing: border-box;
        position: relative;
    }

    /* Header */
    .hub-header {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 16px;
    }

    .hub-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-wrap {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .hub-title {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: var(--text-primary);
        line-height: 1.1;
    }

    .hub-subtitle {
        font-size: 13px;
        color: var(--text-muted);
        font-weight: 500;
    }

    .grocery-pill-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 40px;
        padding: 0 14px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        box-shadow: var(--shadow-ambient);
        cursor: pointer;
        transition: transform 0.16s ease, border-color 0.2s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .grocery-pill-btn:active {
        transform: scale(0.93);
    }

    .grocery-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 999px;
        background: var(--accent);
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
    }

    /* Apple HIG Segmented Control */
    .segmented-control {
        display: flex;
        background: var(--surface-alt);
        padding: 4px;
        border-radius: var(--radius-pill, 999px);
        border: 1px solid var(--border-subtle);
        gap: 4px;
        position: relative;
    }

    .segment-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        height: 38px;
        border-radius: var(--radius-pill, 999px);
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        -webkit-tap-highlight-color: transparent;
    }

    .segment-btn.active {
        background: var(--surface);
        color: var(--accent);
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .segment-btn:active:not(.active) {
        transform: scale(0.96);
    }

    /* Content */
    .hub-content {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    /* Toast */
    .toast-popup {
        position: fixed;
        bottom: calc(90px + env(safe-area-inset-bottom));
        left: 50%;
        transform: translateX(-50%);
        z-index: 200;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: none;
    }

    @keyframes toast-in {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(12px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
    }
</style>
