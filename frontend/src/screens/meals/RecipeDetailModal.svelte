<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import BottomSheet from "$ui/BottomSheet.svelte";
    import Icon from "@iconify/svelte";
    import { t } from "$lib/i18n";
    import { language } from "$lib/settings";
    import {
        type Recipe,
        type Cook,
        type MealSlot,
        type PlannedMeal,
        addIngredientsToGrocery,
        toggleRecipeFavorite,
        normalizePlannedMeal,
    } from "$lib/mealsStore";
    import { createPlannedMeal } from "$api/meals";
    import { mutate } from "$lib/swr";
    import { getFamilyMembers } from "$api/family";
    import { onMount } from "svelte";
    import { formatDateKey } from "$lib/utils";

    export let recipe: Recipe;

    const dispatch = createEventDispatcher<{
        close: void;
        scheduled: { date: string; slot: MealSlot; meal?: PlannedMeal };
        toast: string;
    }>();

    let servings = recipe.baseServings;
    let checkedIngredients: Record<string, boolean> = {};
    let familyMembers: Cook[] = [];
    let isScheduling = false;
    let selectedDate = formatDateKey(new Date());
    let selectedSlot: MealSlot = "dinner";
    let selectedCook: Cook | undefined = undefined;

    $: scale = servings / (recipe.baseServings || 1);

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
            console.error("Failed to load family members for cooking assignment", e);
        }
    });

    function formatAmount(baseAmount: number, factor: number): string {
        const scaled = baseAmount * factor;
        if (scaled >= 10) return Math.round(scaled).toString();
        if (scaled % 1 === 0) return scaled.toString();
        return scaled.toFixed(1).replace(".0", "");
    }

    function toggleIngredient(id: string) {
        checkedIngredients[id] = !checkedIngredients[id];
    }

    async function handleAddMissingToGrocery() {
        const missing = recipe.ingredients
            .filter((ing) => !checkedIngredients[ing.id])
            .map((ing) => ({
                name: ing.name,
                amount: Math.round((Number(ing.amount) || 0) * scale),
                unit: ing.unit,
            }));

        if (missing.length === 0) {
            dispatch("toast", $t.meals.allIngredientsChecked);
            return;
        }

        try {
            const added = await addIngredientsToGrocery(missing, recipe.title);
            dispatch(
                "toast",
                $t.meals.addedToGroceryToast.replace("{n}", String(added))
            );
        } catch (e) {
            console.error("Failed to add to grocery", e);
            dispatch("toast", $t.meals.addGroceryError);
        }
    }

    async function handleSchedule() {
        try {
            const res: any = await createPlannedMeal({
                date: selectedDate,
                slot: selectedSlot,
                title: recipe.title,
                prep_time_minutes: recipe.prepTimeMinutes + recipe.cookTimeMinutes,
                servings,
                recipe_id: recipe.id,
                assigned_cook_id: selectedCook?.id ? String(selectedCook.id) : null,
            });

            const normalized = normalizePlannedMeal(res);
            mutate("planned-meals*");
            dispatch("toast", $t.meals.scheduledToast.replace("{title}", recipe.title));
            dispatch("scheduled", { date: selectedDate, slot: selectedSlot, meal: normalized });
            dispatch("close");
        } catch (e) {
            console.error("Failed to schedule meal", e);
            dispatch("toast", $t.meals.scheduleError);
        }
    }

    // Days for schedule picker (Next 7 days)
    function getUpcomingDays(lang: string) {
        const days = [];
        const base = new Date();
        const locale = lang === "en" ? "en-US" : "ru-RU";
        for (let i = 0; i < 7; i++) {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            days.push({
                key: formatDateKey(d),
                label: i === 0 ? $t.common.today : i === 1 ? $t.common.tomorrow : d.toLocaleDateString(locale, { weekday: "short", day: "numeric" }),
            });
        }
        return days;
    }

    $: upcomingDays = getUpcomingDays($language);

    $: slots = [
        { id: "breakfast" as MealSlot, label: $t.meals.breakfast, icon: "material-symbols:sunny" },
        { id: "lunch" as MealSlot, label: $t.meals.lunch, icon: "material-symbols:wb-twilight" },
        { id: "dinner" as MealSlot, label: $t.meals.dinnerSlot, icon: "material-symbols:bedtime" },
        { id: "snack" as MealSlot, label: $t.meals.snack, icon: "material-symbols:nutrition" },
    ];
</script>

<BottomSheet title="" on:close={() => dispatch("close")} flyY={999} flyDuration={300}>
    <div class="recipe-sheet">
        <!-- Hero Header -->
        <div class="recipe-hero" style="background: {recipe.accentGradient}">
            <div class="hero-top">
                <span class="category-chip">{recipe.tags[0] || $t.meals.recipe}</span>
                <button
                    class="fav-btn"
                    class:active={recipe.isFavorite}
                    on:click={() => toggleRecipeFavorite(recipe.id)}
                    aria-label={$t.meals.toFavorites}
                >
                    <Icon
                        icon={recipe.isFavorite ? "material-symbols:favorite-rounded" : "material-symbols:favorite-outline-rounded"}
                        width={22}
                        height={22}
                    />
                </button>
            </div>
            <div class="hero-emoji">{recipe.emoji}</div>
            <h2 class="hero-title">{recipe.title}</h2>
            <p class="hero-desc">{recipe.description}</p>

            <div class="meta-pills">
                <div class="meta-pill">
                    <Icon icon="material-symbols:timer-outline-rounded" width={16} height={16} />
                    <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} {$t.meals.min}</span>
                </div>
                <div class="meta-pill">
                    <Icon icon="material-symbols:restaurant-menu" width={16} height={16} />
                    <span>{recipe.ingredients.length} {$t.meals.ingredientsCount}</span>
                </div>
            </div>
        </div>

        <!-- Servings Scaler -->
        <div class="servings-bar">
            <div class="servings-label">
                <Icon icon="material-symbols:group-rounded" width={20} height={20} style="color: var(--accent)" />
                <span>{$t.meals.servingsLabelTitle}</span>
            </div>
            <div class="stepper">
                <button
                    class="step-btn"
                    disabled={servings <= 1}
                    on:click={() => (servings = Math.max(1, servings - 1))}
                    aria-label={$t.meals.decrease}
                >
                    <Icon icon="material-symbols:remove-rounded" width={18} height={18} />
                </button>
                <span class="step-value">{servings}</span>
                <button
                    class="step-btn"
                    disabled={servings >= 16}
                    on:click={() => (servings = Math.min(16, servings + 1))}
                    aria-label={$t.meals.increase}
                >
                    <Icon icon="material-symbols:add-rounded" width={18} height={18} />
                </button>
            </div>
        </div>

        <!-- Ingredients Section -->
        <div class="section">
            <div class="section-head">
                <div class="section-title">
                    <Icon icon="material-symbols:format-list-bulleted-rounded" width={20} height={20} style="color: var(--accent)" />
                    <span>{$t.meals.ingredientsTitle}</span>
                </div>
                <button class="add-grocery-quick" on:click={handleAddMissingToGrocery}>
                    <Icon icon="material-symbols:add-shopping-cart-rounded" width={16} height={16} />
                    <span>{$t.meals.toGroceryQuick}</span>
                </button>
            </div>

            <div class="ingredients-list">
                {#each recipe.ingredients as ing (ing.id)}
                    <button
                        class="ingredient-row"
                        class:checked={checkedIngredients[ing.id]}
                        on:click={() => toggleIngredient(ing.id)}
                    >
                        <div class="checkbox" class:checked={checkedIngredients[ing.id]}>
                            {#if checkedIngredients[ing.id]}
                                <Icon icon="material-symbols:check-rounded" width={14} height={14} />
                            {/if}
                        </div>
                        <span class="ing-name" class:crossed={checkedIngredients[ing.id]}>{ing.name}</span>
                        <span class="ing-amount">
                            {formatAmount(ing.amount, scale)} {ing.unit}
                        </span>
                    </button>
                {/each}
            </div>

            <button class="grocery-btn-full" on:click={handleAddMissingToGrocery}>
                <Icon icon="material-symbols:shopping-basket-rounded" width={18} height={18} />
                <span>{$t.meals.addMissingToGrocery}</span>
            </button>
        </div>

        <!-- Instructions Section -->
        <div class="section">
            <div class="section-title">
                <Icon icon="material-symbols:cooking-rounded" width={20} height={20} style="color: var(--accent)" />
                <span>{$t.meals.stepsTitle}</span>
            </div>

            <div class="steps-list">
                {#each recipe.steps as step (step.number)}
                    <div class="step-card">
                        <div class="step-num">{step.number}</div>
                        <p class="step-text">{step.text}</p>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Schedule Mode Panel -->
        {#if isScheduling}
            <div class="schedule-panel">
                <h3 class="sched-title">{$t.meals.schedulePanelTitle}</h3>

                <!-- Day Selector -->
                <div class="picker-group">
                    <span class="picker-label">{$t.meals.dayOfWeek}</span>
                    <div class="chip-scroll">
                        {#each upcomingDays as day}
                            <button
                                class="picker-chip"
                                class:active={selectedDate === day.key}
                                on:click={() => (selectedDate = day.key)}
                            >
                                {day.label}
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Slot Selector -->
                <div class="picker-group">
                    <span class="picker-label">{$t.meals.mealSlotLabel}</span>
                    <div class="slots-grid">
                        {#each slots as s}
                            <button
                                class="slot-chip"
                                class:active={selectedSlot === s.id}
                                on:click={() => (selectedSlot = s.id)}
                            >
                                <Icon icon={s.icon} width={16} height={16} />
                                <span>{s.label}</span>
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Cook Selector -->
                {#if familyMembers.length > 0}
                    <div class="picker-group">
                        <span class="picker-label">{$t.meals.whoIsCooking}</span>
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

                <div class="sched-actions">
                    <button class="sched-confirm" on:click={handleSchedule}>
                        <Icon icon="material-symbols:check-rounded" width={20} height={20} />
                        <span>{$t.meals.confirmSchedule}</span>
                    </button>
                    <button class="sched-cancel" on:click={() => (isScheduling = false)}>
                        {$t.common.cancel}
                    </button>
                </div>
            </div>
        {:else}
            <!-- Bottom CTA -->
            <div class="bottom-cta">
                <button class="schedule-main-btn" on:click={() => (isScheduling = true)}>
                    <Icon icon="material-symbols:event-available-rounded" width={20} height={20} />
                    <span>{$t.meals.scheduleInMenu}</span>
                </button>
            </div>
        {/if}
    </div>
</BottomSheet>

<style>
    .recipe-sheet {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 0 16px 20px;
    }

    /* Hero */
    .recipe-hero {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-card, 22px);
        padding: 20px;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .hero-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .category-chip {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 4px 10px;
        border-radius: var(--radius-pill, 999px);
        background: rgba(255, 255, 255, 0.22);
        backdrop-filter: blur(8px);
    }

    .fav-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.22);
        border: none;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.16s ease;
    }

    .fav-btn:active {
        transform: scale(0.9);
    }

    .fav-btn.active {
        background: #ffffff;
        color: #ef4444;
    }

    .hero-emoji {
        font-size: 42px;
        line-height: 1;
        margin-top: 4px;
    }

    .hero-title {
        font-size: 22px;
        font-weight: 800;
        line-height: 1.2;
        margin: 0;
        letter-spacing: -0.4px;
    }

    .hero-desc {
        font-size: 13px;
        line-height: 1.4;
        opacity: 0.92;
        margin: 0;
    }

    .meta-pills {
        display: flex;
        gap: 8px;
        margin-top: 4px;
    }

    .meta-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        font-weight: 600;
        background: rgba(0, 0, 0, 0.2);
        padding: 4px 10px;
        border-radius: var(--radius-pill, 999px);
    }

    /* Servings Bar */
    .servings-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-radius: var(--radius-card, 18px);
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
    }

    .servings-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .stepper {
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--surface);
        padding: 4px 8px;
        border-radius: var(--radius-pill, 999px);
        border: 1px solid var(--border-subtle);
    }

    .step-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--surface-alt);
        border: none;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease;
    }

    .step-btn:active:not(:disabled) {
        transform: scale(0.9);
    }

    .step-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }

    .step-value {
        font-size: 15px;
        font-weight: 800;
        min-width: 20px;
        text-align: center;
        color: var(--text-primary);
    }

    /* Sections */
    .section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .add-grocery-quick {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--accent-soft);
        color: var(--accent);
        border: none;
        padding: 4px 10px;
        border-radius: var(--radius-pill, 999px);
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.15s ease;
    }

    .add-grocery-quick:active {
        transform: scale(0.93);
    }

    .ingredients-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .ingredient-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 14px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        cursor: pointer;
        text-align: left;
        transition: background 0.2s ease;
    }

    .ingredient-row.checked {
        opacity: 0.65;
        background: color-mix(in srgb, var(--surface-alt) 80%, var(--surface));
    }

    .checkbox {
        width: 22px;
        height: 22px;
        border-radius: 7px;
        border: 2px solid var(--border);
        background: var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        flex-shrink: 0;
        transition: all 0.16s ease;
    }

    .checkbox.checked {
        background: var(--success);
        border-color: var(--success);
    }

    .ing-name {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
    }

    .ing-name.crossed {
        text-decoration: line-through;
        color: var(--text-muted);
    }

    .ing-amount {
        font-size: 13px;
        font-weight: 700;
        color: var(--accent);
        flex-shrink: 0;
    }

    .grocery-btn-full {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        border-radius: var(--radius-card, 18px);
        background: var(--surface-alt);
        border: 1px dashed var(--accent);
        color: var(--accent);
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.15s ease, background 0.2s ease;
    }

    .grocery-btn-full:active {
        transform: scale(0.98);
        background: var(--accent-soft);
    }

    /* Steps */
    .steps-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .step-card {
        display: flex;
        gap: 12px;
        padding: 12px 14px;
        border-radius: var(--radius-card, 18px);
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
    }

    .step-num {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 13px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .step-text {
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
        color: var(--text-primary);
    }

    /* Schedule Panel */
    .schedule-panel {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px;
        border-radius: var(--radius-card, 20px);
        background: var(--surface-alt);
        border: 1.5px solid var(--accent);
        margin-top: 6px;
    }

    .sched-title {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        color: var(--text-primary);
    }

    .picker-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .picker-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }

    .chip-scroll {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 2px;
    }

    .picker-chip {
        padding: 7px 12px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        font-size: 12px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.16s ease;
    }

    .picker-chip.active {
        background: var(--accent);
        color: #ffffff;
        border-color: var(--accent);
    }

    .slots-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .slot-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 12px;
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        font-size: 12px;
        font-weight: 600;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.16s ease;
    }

    .slot-chip.active {
        background: var(--accent);
        color: #ffffff;
        border-color: var(--accent);
    }

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
        background: var(--surface);
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

    .sched-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 6px;
    }

    .sched-confirm {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        height: 46px;
        border-radius: var(--radius-card, 18px);
        background: var(--accent-gradient, var(--accent));
        color: #ffffff;
        border: none;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: var(--shadow-floating);
    }

    .sched-cancel {
        height: 36px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
    }

    /* Bottom CTA */
    .bottom-cta {
        margin-top: 6px;
    }

    .schedule-main-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        height: 50px;
        border-radius: var(--radius-card, 20px);
        background: var(--accent-gradient, var(--accent));
        color: #ffffff;
        border: none;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: var(--shadow-floating);
        transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .schedule-main-btn:active {
        transform: scale(0.97);
    }
</style>
