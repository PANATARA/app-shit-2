<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import BottomSheet from "$ui/BottomSheet.svelte";
    import Icon from "@iconify/svelte";
    import {
        type MealSlot,
        type Cook,
        type Recipe,
        type PlannedMeal,
        useFamilyRecipes,
        normalizePlannedMeal,
    } from "$lib/mealsStore";
    import { createPlannedMeal } from "$api/meals";
    import { mutate } from "$lib/swr";
    import { getFamilyMembers } from "$api/family";

    export let targetDate: string; // YYYY-MM-DD
    export let defaultSlot: MealSlot = "dinner";

    const dispatch = createEventDispatcher<{
        close: void;
        added: PlannedMeal;
    }>();

    let mode: "recipe" | "manual" = "recipe";
    let selectedSlot: MealSlot = defaultSlot;
    let manualTitle = "";
    let prepTime = 25;
    let servings = 4;
    let selectedRecipe: Recipe | null = null;
    let familyMembers: Cook[] = [];
    let selectedCook: Cook | undefined = undefined;
    let isSaving = false;
    let errorMessage = "";

    const recipesSWR = useFamilyRecipes();
    $: recipes = $recipesSWR.data ?? [];

    onMount(async () => {
        try {
            const res = await getFamilyMembers();
            if (Array.isArray(res)) {
                familyMembers = res.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    icon: m.icon,
                    icon_bg: m.icon_bg,
                    icon_color: m.icon_color,
                }));
                if (familyMembers.length > 0) {
                    selectedCook = familyMembers[0];
                }
            }
        } catch (e) {
            console.error("Failed to load family members", e);
        }
    });

    const slots: { id: MealSlot; label: string; icon: string }[] = [
        { id: "breakfast", label: "Завтрак", icon: "material-symbols:sunny" },
        { id: "lunch", label: "Обед", icon: "material-symbols:wb-twilight" },
        { id: "dinner", label: "Ужин", icon: "material-symbols:bedtime" },
        { id: "snack", label: "Перекус", icon: "material-symbols:nutrition" },
    ];

    async function handleSave() {
        const title = mode === "recipe" && selectedRecipe ? selectedRecipe.title : manualTitle.trim();
        if (!title || isSaving) return;

        isSaving = true;
        errorMessage = "";
        try {
            const res: any = await createPlannedMeal({
                date: targetDate,
                slot: selectedSlot,
                title,
                prep_time_minutes: prepTime,
                servings,
                recipe_id: mode === "recipe" && selectedRecipe ? selectedRecipe.id : null,
                assigned_cook_id: selectedCook?.id ? String(selectedCook.id) : null,
            });

            const normalized = normalizePlannedMeal(res);
            mutate("planned-meals*");
            dispatch("added", normalized);
            dispatch("close");
        } catch (e: any) {
            console.error("Failed to add planned meal", e);
            errorMessage = e?.message || "Не удалось запланировать блюдо";
        } finally {
            isSaving = false;
        }
    }
</script>

<BottomSheet title="Добавить блюдо" on:close={() => dispatch("close")} flyY={999} flyDuration={280}>
    <div class="add-meal-sheet">
        <!-- Mode Switcher -->
        <div class="mode-tabs">
            <button
                class="mode-tab"
                class:active={mode === "recipe"}
                on:click={() => (mode = "recipe")}
            >
                <Icon icon="material-symbols:menu-book-rounded" width={16} height={16} />
                <span>Из рецептов ({recipes.length})</span>
            </button>
            <button
                class="mode-tab"
                class:active={mode === "manual"}
                on:click={() => (mode = "manual")}
            >
                <Icon icon="material-symbols:edit-note-rounded" width={16} height={16} />
                <span>Быстрый ввод</span>
            </button>
        </div>

        <!-- Meal Slot Selector -->
        <div class="form-group">
            <span class="group-label">Приём пищи:</span>
            <div class="slots-grid">
                {#each slots as s}
                    <button
                        class="slot-btn"
                        class:active={selectedSlot === s.id}
                        on:click={() => (selectedSlot = s.id)}
                    >
                        <Icon icon={s.icon} width={18} height={18} />
                        <span>{s.label}</span>
                    </button>
                {/each}
            </div>
        </div>

        <!-- Mode A: Pick Recipe -->
        {#if mode === "recipe"}
            <div class="form-group">
                <span class="group-label">Выберите рецепт семьи:</span>
                <div class="recipes-picker-list">
                    {#each recipes as r (r.id)}
                        <button
                            class="recipe-pick-item"
                            class:selected={selectedRecipe?.id === r.id}
                            on:click={() => {
                                selectedRecipe = r;
                                prepTime = r.prepTimeMinutes + r.cookTimeMinutes;
                                servings = r.baseServings;
                            }}
                        >
                            <span class="pick-emoji">{r.emoji}</span>
                            <div class="pick-info">
                                <span class="pick-title">{r.title}</span>
                                <span class="pick-sub">⏱ {r.prepTimeMinutes + r.cookTimeMinutes} мин • 👥 {r.baseServings} порц.</span>
                            </div>
                            <div class="pick-radio" class:checked={selectedRecipe?.id === r.id}>
                                {#if selectedRecipe?.id === r.id}
                                    <Icon icon="material-symbols:check-rounded" width={14} height={14} />
                                {/if}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {:else}
            <!-- Mode B: Manual Title -->
            <div class="form-group">
                <span class="group-label">Название блюда:</span>
                <input
                    type="text"
                    class="dish-input"
                    placeholder="Например: Тыквенный крем-суп с сухариками"
                    bind:value={manualTitle}
                />
            </div>
        {/if}

        <!-- Cook Assignment -->
        {#if familyMembers.length > 0}
            <div class="form-group">
                <span class="group-label">Кто готовит:</span>
                <div class="cook-chips">
                    {#each familyMembers as cook}
                        <button
                            class="cook-chip"
                            class:active={selectedCook?.id === cook.id}
                            on:click={() => (selectedCook = cook)}
                        >
                            <span class="cook-dot" style="background: {cook.icon_color || 'var(--accent)'}"></span>
                            <span>{cook.name}</span>
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Time and Servings -->
        <div class="two-col-group">
            <div class="col-item">
                <span class="group-label">Время (мин):</span>
                <input type="number" class="dish-input small" min="5" max="180" bind:value={prepTime} />
            </div>
            <div class="col-item">
                <span class="group-label">Порций:</span>
                <input type="number" class="dish-input small" min="1" max="16" bind:value={servings} />
            </div>
        </div>

        <!-- Submit Button -->
        <div class="actions">
            <button
                class="submit-btn"
                disabled={mode === "recipe" ? !selectedRecipe : !manualTitle.trim()}
                on:click={handleSave}
            >
                <Icon icon="material-symbols:add-task-rounded" width={20} height={20} />
                <span>Добавить в меню</span>
            </button>
        </div>
    </div>
</BottomSheet>

<style>
    .add-meal-sheet {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 4px 16px 20px;
    }

    /* Mode Tabs */
    .mode-tabs {
        display: flex;
        background: var(--surface-alt);
        padding: 4px;
        border-radius: var(--radius-pill, 999px);
        gap: 4px;
    }

    .mode-tab {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 38px;
        border-radius: var(--radius-pill, 999px);
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .mode-tab.active {
        background: var(--surface);
        color: var(--text-primary);
        font-weight: 700;
        box-shadow: var(--shadow-ambient);
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .group-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }

    /* Slots Grid */
    .slots-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .slot-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 14px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.16s ease;
    }

    .slot-btn.active {
        background: var(--accent);
        color: #ffffff;
        border-color: var(--accent);
        box-shadow: 0 4px 12px var(--accent-glow);
    }

    /* Recipes list picker */
    .recipes-picker-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 220px;
        overflow-y: auto;
        padding-right: 2px;
    }

    .recipe-pick-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 14px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        cursor: pointer;
        text-align: left;
        transition: all 0.16s ease;
    }

    .recipe-pick-item.selected {
        border-color: var(--accent);
        background: var(--accent-soft);
    }

    .pick-emoji {
        font-size: 24px;
        line-height: 1;
    }

    .pick-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .pick-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .pick-sub {
        font-size: 11px;
        color: var(--text-muted);
    }

    .pick-radio {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid var(--border);
        background: var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        flex-shrink: 0;
    }

    .pick-radio.checked {
        background: var(--accent);
        border-color: var(--accent);
    }

    /* Input */
    .dish-input {
        width: 100%;
        box-sizing: border-box;
        height: 46px;
        padding: 0 14px;
        border-radius: 14px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        font-size: 15px;
        color: var(--text-primary);
        outline: none;
        transition: border-color 0.2s ease;
    }

    .dish-input:focus {
        border-color: var(--accent);
    }

    .dish-input.small {
        font-size: 16px;
        font-weight: 700;
    }

    /* Cook chips */
    .cook-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .cook-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        font-size: 12px;
        font-weight: 600;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.16s ease;
    }

    .cook-chip.active {
        border-color: var(--accent);
        background: var(--accent-soft);
        color: var(--accent);
    }

    .cook-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .two-col-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .col-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    /* Actions */
    .actions {
        margin-top: 4px;
    }

    .submit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        height: 48px;
        border-radius: var(--radius-card, 18px);
        background: var(--accent-gradient, var(--accent));
        color: #ffffff;
        border: none;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: var(--shadow-floating);
        transition: transform 0.16s ease, opacity 0.2s ease;
    }

    .submit-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }

    .submit-btn:active:not(:disabled) {
        transform: scale(0.97);
    }
</style>
