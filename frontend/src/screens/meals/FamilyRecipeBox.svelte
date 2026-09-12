<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import {
        type Recipe,
        useFamilyRecipes,
        useWeeklyMealPlanner,
        toggleRecipeFavorite,
        isRecipePlannedThisWeek,
    } from "$lib/mealsStore";
    import { formatDateKey } from "$lib/utils";
    import AddCustomRecipeModal from "./AddCustomRecipeModal.svelte";

    const dispatch = createEventDispatcher<{
        selectRecipe: Recipe;
    }>();

    let addCustomRecipeModalOpen = false;
    let searchQuery = "";
    let activeFilter: "all" | "quick" | "favorites" | "kids" | "dinner" | "desserts" = "all";

    const filters: { id: typeof activeFilter; label: string; icon: string }[] = [
        { id: "all", label: "Все рецепты", icon: "material-symbols:local-dining-rounded" },
        { id: "quick", label: "Быстрые (<20м)", icon: "material-symbols:bolt-rounded" },
        { id: "favorites", label: "Любимые", icon: "material-symbols:favorite-rounded" },
        { id: "kids", label: "Детям", icon: "material-symbols:child-care" },
        { id: "dinner", label: "Ужины", icon: "material-symbols:dinner-dining-rounded" },
        { id: "desserts", label: "Десерты", icon: "material-symbols:cake-rounded" },
    ];

    // Compute dates of current week
    function getCurrentWeekDates(): string[] {
        const d = new Date();
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);

        return Array.from({ length: 7 }, (_, i) => {
            const next = new Date(d);
            next.setDate(d.getDate() + i);
            return formatDateKey(next);
        });
    }

    const currentWeekDates = getCurrentWeekDates();

    const recipesSWR = useFamilyRecipes();
    const mealsSWR = useWeeklyMealPlanner(currentWeekDates[0], currentWeekDates[6]);

    $: allRecipes = $recipesSWR.data ?? [];
    $: allMeals = $mealsSWR.data ?? [];
    $: loading = $recipesSWR.loading;

    $: filteredRecipes = allRecipes.filter((r) => {
        // Text match
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const matchTitle = r.title.toLowerCase().includes(q);
            const matchTags = r.tags.some((t) => t.toLowerCase().includes(q));
            const matchIng = r.ingredients.some((i) => i.name.toLowerCase().includes(q));
            if (!matchTitle && !matchTags && !matchIng) return false;
        }

        // Category Filter
        if (activeFilter === "favorites") return r.isFavorite;
        if (activeFilter === "quick") return (r.prepTimeMinutes + r.cookTimeMinutes) <= 25 || r.category === "quick";
        if (activeFilter === "kids") return r.category === "kids" || r.tags.includes("Детям");
        if (activeFilter === "dinner") return r.category === "dinner" || r.tags.includes("Ужин");
        if (activeFilter === "desserts") return r.category === "desserts" || r.tags.includes("Десерт");

        return true;
    });

    function getPlannedStatus(recipeId: string): boolean {
        return isRecipePlannedThisWeek(recipeId, currentWeekDates, allMeals) !== null;
    }
</script>

<div class="recipe-box-view">
    <!-- Top Search & Add Button -->
    <div class="search-and-actions">
        <div class="search-wrap">
            <Icon icon="material-symbols:search-rounded" width={22} height={22} style="color: var(--text-muted)" />
            <input
                type="text"
                class="search-input"
                placeholder="Поиск по названию или ингредиентам..."
                bind:value={searchQuery}
            />
            {#if searchQuery}
                <button class="clear-btn" on:click={() => (searchQuery = "")}>
                    <Icon icon="material-symbols:close-rounded" width={16} height={16} />
                </button>
            {/if}
        </div>
        <button
            type="button"
            class="add-recipe-btn"
            on:click={() => (addCustomRecipeModalOpen = true)}
            aria-label="Добавить блюдо в книгу рецептов"
        >
            <Icon icon="material-symbols:add-rounded" width={18} height={18} />
            <span>Своё блюдо</span>
        </button>
    </div>

    <!-- Filter Chips -->
    <div class="filters-scroll">
        {#each filters as f}
            <button
                class="filter-chip"
                class:active={activeFilter === f.id}
                on:click={() => (activeFilter = f.id)}
            >
                <Icon icon={f.icon} width={16} height={16} />
                <span>{f.label}</span>
            </button>
        {/each}
    </div>

    <!-- Recipe Grid -->
    {#if loading}
        <div class="empty-state">
            <div class="empty-icon">⏳</div>
            <span class="empty-title">Загрузка рецептов...</span>
        </div>
    {:else if allRecipes.length === 0}
        <div class="empty-state">
            <div class="empty-icon">📖</div>
            <span class="empty-title">В книге рецептов пока пусто</span>
            <span class="empty-desc">Добавляйте фирменные семейные блюда — они будут доступны всем членам вашей семьи!</span>
            <button
                type="button"
                class="add-first-btn"
                on:click={() => (addCustomRecipeModalOpen = true)}
            >
                <Icon icon="material-symbols:add-rounded" width={20} height={20} />
                <span>Добавить первое блюдо</span>
            </button>
        </div>
    {:else if filteredRecipes.length === 0}
        <div class="empty-state">
            <div class="empty-icon">🍳</div>
            <span class="empty-title">Рецепты не найдены</span>
            <span class="empty-desc">Попробуйте изменить поисковый запрос или категорию</span>
        </div>
    {:else}
        <div class="recipes-grid">
            {#each filteredRecipes as recipe (recipe.id)}
                {@const isPlanned = getPlannedStatus(recipe.id)}
                <div
                    class="recipe-card"
                    on:click={() => dispatch("selectRecipe", recipe)}
                    on:keydown={(e) => e.key === "Enter" && dispatch("selectRecipe", recipe)}
                    role="button"
                    tabindex="0"
                >
                    <!-- Card Top Banner -->
                    <div class="card-thumb" style="background: {recipe.accentGradient}">
                        <span class="thumb-emoji">{recipe.emoji}</span>

                        <button
                            class="fav-badge"
                            class:active={recipe.isFavorite}
                            on:click|stopPropagation={() => toggleRecipeFavorite(recipe.id)}
                            aria-label="В избранное"
                        >
                            <Icon
                                icon={recipe.isFavorite ? "material-symbols:favorite-rounded" : "material-symbols:favorite-outline-rounded"}
                                width={18}
                                height={18}
                            />
                        </button>

                        {#if isPlanned}
                            <div class="planned-ribbon">
                                <Icon icon="material-symbols:calendar-month-rounded" width={12} height={12} />
                                <span>В меню недели</span>
                            </div>
                        {/if}
                    </div>

                    <!-- Card Body -->
                    <div class="card-content">
                        <span class="recipe-title">{recipe.title}</span>

                        <div class="meta-row">
                            <span class="meta-item">
                                <Icon icon="material-symbols:timer-outline-rounded" width={14} height={14} />
                                <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} мин</span>
                            </span>
                            <span class="meta-item">
                                <Icon icon="material-symbols:group-rounded" width={14} height={14} />
                                <span>{recipe.baseServings} порц.</span>
                            </span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

{#if addCustomRecipeModalOpen}
    <AddCustomRecipeModal
        on:close={() => (addCustomRecipeModalOpen = false)}
        on:saved={(e) => {
            dispatch("selectRecipe", e.detail);
        }}
    />
{/if}

<style>
    .recipe-box-view {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .search-and-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
    }

    /* Search Wrap */
    .search-wrap {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-pill, 999px);
        box-shadow: var(--shadow-ambient);
        padding: 10px 16px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .add-recipe-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 44px;
        padding: 0 16px;
        background: var(--accent-gradient, var(--accent));
        border: none;
        border-radius: var(--radius-pill, 999px);
        color: #ffffff;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: var(--shadow-floating);
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
        flex-shrink: 0;
    }

    .add-recipe-btn:active {
        transform: scale(0.95);
    }

    .search-wrap:focus-within {
        border-color: var(--accent);
        box-shadow: 0 2px 10px var(--accent-soft);
    }

    .search-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: var(--text-primary);
        font-size: 14px;
        font-family: inherit;
        min-width: 0;
    }

    .search-input::placeholder {
        color: var(--text-muted);
    }

    .clear-btn {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--surface-alt);
        border: none;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    /* Filters */
    .filters-scroll {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 2px;
        scrollbar-width: none;
    }

    .filters-scroll::-webkit-scrollbar {
        display: none;
    }

    .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.16s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .filter-chip:active {
        transform: scale(0.94);
    }

    .filter-chip.active {
        background: var(--accent);
        color: #ffffff;
        border-color: var(--accent);
        box-shadow: 0 3px 10px var(--accent-glow);
    }

    /* Recipe Grid */
    .recipes-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
    }

    .recipe-card {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-card, 22px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .recipe-card:active {
        transform: scale(0.97);
    }

    /* Card Thumb */
    .card-thumb {
        height: 100px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .thumb-emoji {
        font-size: 42px;
        line-height: 1;
        filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15));
    }

    .fav-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.28);
        backdrop-filter: blur(8px);
        border: none;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease;
    }

    .fav-badge:active {
        transform: scale(0.88);
    }

    .fav-badge.active {
        background: #ffffff;
        color: #ef4444;
    }

    .planned-ribbon {
        position: absolute;
        bottom: 6px;
        left: 8px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(8px);
        color: #ffffff;
        padding: 3px 8px;
        border-radius: var(--radius-pill, 999px);
        font-size: 10px;
        font-weight: 700;
    }

    /* Card Content */
    .card-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        justify-content: space-between;
    }

    .recipe-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.25;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .meta-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
    }

    .meta-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
    }

    /* Empty */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px 16px;
        text-align: center;
        gap: 8px;
    }

    .empty-icon {
        font-size: 44px;
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
        max-width: 280px;
        line-height: 1.4;
    }

    .add-first-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        padding: 10px 20px;
        border-radius: var(--radius-pill, 999px);
        background: var(--accent-gradient, var(--accent));
        border: none;
        color: #ffffff;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 30%, transparent);
        transition: transform 0.16s ease;
    }

    .add-first-btn:active {
        transform: scale(0.95);
    }
</style>
