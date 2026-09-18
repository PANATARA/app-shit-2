<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import WeekCalendar from "$ui/WeekCalendar.svelte";
    import { swr } from "$lib/swr";
    import { formatDateKey } from "$lib/utils";
    import {
        getPlannedMeals,
        deletePlannedMeal,
        togglePlannedMeal,
    } from "$api/meals";
    import {
        normalizePlannedMeal,
        type PlannedMeal,
        type MealSlot,
        type Recipe,
        useFamilyRecipes,
    } from "$lib/mealsStore";

    const dispatch = createEventDispatcher<{
        addMeal: { date: string; slot: MealSlot };
        openRecipe: Recipe;
    }>();

    // ─── State (BoardScreen architecture) ─────────────────────────────────────────

    let selectedDate = new Date();
    let optimisticMeals: PlannedMeal[] | null = null;

    $: dateKey = formatDateKey(selectedDate);

    // Сбрасываем оптимистичные данные при смене даты
    $: if (dateKey) optimisticMeals = null;

    function handleDateChange(event: CustomEvent<Date>) {
        selectedDate = event.detail;
    }

    export function setDate(d: Date) {
        selectedDate = d;
    }

    export function setDateString(str: string) {
        const parts = str.split("-").map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
            selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        }
    }

    // ─── Data fetching (BoardScreen architecture) ─────────────────────────────────

    $: meals = swr<PlannedMeal[]>(
        `planned-meals:${dateKey}`,
        async () => {
            const res: any = await getPlannedMeals({ due_date: dateKey });
            return (res?.meals || []).map(normalizePlannedMeal);
        }
    );

    const recipesSWR = useFamilyRecipes();

    $: loading = $meals.loading;
    $: allMeals = $meals.data ?? [];
    $: plannedMeals = optimisticMeals ?? allMeals;
    $: allRecipes = $recipesSWR.data ?? [];

    export async function revalidate() {
        await meals.revalidate();
    }

    export function addOptimisticMeal(meal: PlannedMeal) {
        if (meal.date === dateKey) {
            optimisticMeals = [...plannedMeals, meal];
        }
    }

    // ─── Handlers ────────────────────────────────────────────────────────────────

    async function toggleMeal(meal: PlannedMeal) {
        const previous = plannedMeals;
        const isCompleted = !meal.isCompleted;

        // Оптимистичное обновление
        optimisticMeals = plannedMeals.map((m) =>
            m.id === meal.id ? { ...m, isCompleted } : m
        );

        try {
            await togglePlannedMeal(meal.id);
            await meals.revalidate();
            optimisticMeals = null;
        } catch (e) {
            optimisticMeals = previous;
            console.error(e);
        }
    }

    async function deleteMeal(meal: PlannedMeal) {
        const previous = plannedMeals;

        // Оптимистичное удаление
        optimisticMeals = plannedMeals.filter((m) => m.id !== meal.id);

        try {
            await deletePlannedMeal(meal.id);
            await meals.revalidate();
            optimisticMeals = null;
        } catch (e) {
            optimisticMeals = previous;
            console.error(e);
        }
    }

    const slotDefinitions: {
        id: MealSlot;
        name: string;
        icon: string;
        color: string;
        bg: string;
    }[] = [
        {
            id: "breakfast",
            name: "Завтрак",
            icon: "material-symbols:sunny",
            color: "#D97706",
            bg: "rgba(245, 158, 11, 0.12)",
        },
        {
            id: "lunch",
            name: "Обед",
            icon: "material-symbols:wb-twilight",
            color: "#2563EB",
            bg: "rgba(37, 99, 235, 0.12)",
        },
        {
            id: "dinner",
            name: "Ужин",
            icon: "material-symbols:bedtime",
            color: "#E06A47",
            bg: "rgba(224, 106, 71, 0.12)",
        },
        {
            id: "snack",
            name: "Перекусы и десерты",
            icon: "material-symbols:nutrition",
            color: "#059669",
            bg: "rgba(16, 185, 129, 0.12)",
        },
    ];

    $: slotsWithMeals = slotDefinitions.map((slotDef) => ({
        ...slotDef,
        meals: plannedMeals.filter((m) => m.slot === slotDef.id),
    }));

    function handleMealClick(meal: PlannedMeal) {
        if (meal.recipeId) {
            const r = allRecipes.find((item) => item.id === meal.recipeId);
            if (r) {
                dispatch("openRecipe", r);
            }
        }
    }
</script>

<div class="planner-view">
    <!-- Week Calendar -->
    <div class="calendar-card">
        <WeekCalendar {selectedDate} on:change={handleDateChange} />
    </div>

    <!-- Day Header Info -->
    <div class="day-header-banner">
        <div class="date-titles">
            <h3 class="current-day-name">
                {selectedDate.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            <span class="meal-count-badge">
                {plannedMeals.length === 0 ? "Меню не составлено" : `Запланировано блюд: ${plannedMeals.length}`}
            </span>
        </div>

        <button
            class="quick-add-btn"
            on:click={() => dispatch("addMeal", { date: dateKey, slot: "dinner" })}
            aria-label="Добавить блюдо"
        >
            <Icon icon="material-symbols:add-rounded" width={20} height={20} />
            <span>Добавить</span>
        </button>
    </div>

    <!-- Meal Slots -->
    <div class="slots-list">
        {#each slotsWithMeals as slotDef (slotDef.id)}
            <div class="slot-card">
                <!-- Slot Header -->
                <div class="slot-head">
                    <div class="slot-badge" style="background: {slotDef.bg}; color: {slotDef.color}">
                        <Icon icon={slotDef.icon} width={18} height={18} />
                        <span class="slot-name">{slotDef.name}</span>
                    </div>

                    <button
                        class="slot-add-trigger"
                        on:click={() => dispatch("addMeal", { date: dateKey, slot: slotDef.id })}
                        aria-label="Добавить в {slotDef.name}"
                    >
                        <Icon icon="material-symbols:add-rounded" width={18} height={18} />
                    </button>
                </div>

                <!-- Slot Items -->
                {#if slotDef.meals.length > 0}
                    <div class="meals-in-slot">
                        {#each slotDef.meals as meal (meal.id)}
                            <div
                                class="meal-item"
                                class:meal-completed={meal.isCompleted}
                                class:clickable={!!meal.recipeId}
                                on:click={() => handleMealClick(meal)}
                                on:keydown={(e) => e.key === "Enter" && handleMealClick(meal)}
                                role="button"
                                tabindex="0"
                            >
                                <button
                                    class="check-meal-btn"
                                    class:checked={meal.isCompleted}
                                    on:click|stopPropagation={() => toggleMeal(meal)}
                                    aria-label={meal.isCompleted ? "Отметить неприготовленным" : "Отметить приготовленным"}
                                >
                                    <Icon
                                        icon={meal.isCompleted ? "material-symbols:check-circle-rounded" : "material-symbols:radio-button-unchecked"}
                                        width={22}
                                        height={22}
                                    />
                                </button>

                                <div class="meal-main">
                                    <div class="meal-title-row">
                                        <span class="meal-title" class:completed-text={meal.isCompleted}>{meal.title}</span>
                                        {#if meal.recipeId}
                                            <span class="recipe-tag" title="Смотреть рецепт">
                                                <Icon icon="material-symbols:menu-book-rounded" width={14} height={14} />
                                                <span>Рецепт</span>
                                            </span>
                                        {/if}
                                    </div>

                                    <div class="meal-meta-row">
                                        {#if meal.prepTimeMinutes}
                                            <span class="time-tag">
                                                <Icon icon="material-symbols:timer-outline-rounded" width={14} height={14} />
                                                <span>{meal.prepTimeMinutes} мин</span>
                                            </span>
                                        {/if}

                                        {#if meal.cook}
                                            <div class="cook-badge">
                                                <span class="cook-dot" style="background: {meal.cook.icon_color || 'var(--accent)'}"></span>
                                                <span class="cook-name">{meal.cook.name}</span>
                                            </div>
                                        {/if}
                                    </div>
                                </div>

                                <button
                                    class="delete-meal-btn"
                                    on:click|stopPropagation={() => deleteMeal(meal)}
                                    aria-label="Удалить из меню"
                                >
                                    <Icon icon="material-symbols:delete-outline-rounded" width={18} height={18} />
                                </button>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <!-- Empty Slot Placeholder -->
                    <button
                        class="slot-empty"
                        on:click={() => dispatch("addMeal", { date: dateKey, slot: slotDef.id })}
                    >
                        <Icon icon="material-symbols:add-circle-outline-rounded" width={18} height={18} />
                        <span>Нажмите, чтобы запланировать {slotDef.name.toLowerCase()}</span>
                    </button>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    .planner-view {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    /* Week Calendar Card */
    .calendar-card {
        display: flex;
        flex-direction: column;
        background: var(--surface);
        border-radius: var(--radius-card, 20px);
        border: 1px solid var(--border-subtle);
        padding: 8px 4px 10px;
        box-shadow: var(--shadow-card);
    }

    /* Day Banner */
    .day-header-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2px 4px;
    }

    .date-titles {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .current-day-name {
        margin: 0;
        font-size: 17px;
        font-weight: 800;
        color: var(--text-primary);
        text-transform: capitalize;
    }

    .meal-count-badge {
        font-size: 12px;
        color: var(--text-muted);
        font-weight: 500;
    }

    .quick-add-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 14px;
        border-radius: var(--radius-pill, 999px);
        background: var(--accent-soft);
        color: var(--accent);
        border: none;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.15s ease;
    }

    .quick-add-btn:active {
        transform: scale(0.92);
    }

    /* Slots List */
    .slots-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .slot-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border-radius: var(--radius-card, 22px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
    }

    .slot-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .slot-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: var(--radius-pill, 999px);
        font-size: 12px;
        font-weight: 700;
    }

    .slot-name {
        letter-spacing: 0.2px;
    }

    .slot-add-trigger {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease;
    }

    .slot-add-trigger:active {
        transform: scale(0.88);
    }

    /* Meals In Slot */
    .meals-in-slot {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .meal-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        border-radius: 16px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        gap: 12px;
        transition: transform 0.16s ease, opacity 0.2s ease;
    }

    .meal-item.meal-completed {
        opacity: 0.65;
    }

    .meal-item.clickable {
        cursor: pointer;
    }

    .meal-item.clickable:active {
        transform: scale(0.98);
    }

    .check-meal-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        border-radius: 50%;
        transition: color 0.15s ease, transform 0.15s ease;
        -webkit-tap-highlight-color: transparent;
        flex-shrink: 0;
    }

    .check-meal-btn:active {
        transform: scale(0.85);
    }

    .check-meal-btn.checked {
        color: var(--success, #10B981);
    }

    .completed-text {
        text-decoration: line-through;
        color: var(--text-muted) !important;
    }

    .meal-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
    }

    .meal-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .meal-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.25;
    }

    .recipe-tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 7px;
        border-radius: var(--radius-pill, 999px);
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 10px;
        font-weight: 700;
    }

    .meal-meta-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    .time-tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
    }

    .cook-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 8px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
    }

    .cook-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
    }

    .cook-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
    }

    .delete-meal-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: transparent;
        border: none;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 0.15s ease, transform 0.15s ease;
    }

    .delete-meal-btn:active {
        transform: scale(0.88);
        color: #ef4444;
    }

    /* Slot Empty */
    .slot-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px;
        border-radius: 14px;
        border: 1px dashed var(--border);
        background: transparent;
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease;
    }

    .slot-empty:active {
        background: var(--surface-alt);
        border-color: var(--accent);
        color: var(--accent);
    }
</style>
