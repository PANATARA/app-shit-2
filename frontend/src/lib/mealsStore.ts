import { writable } from "svelte/store";
import { swr, mutate } from "./swr";
import {
    getRecipes,
    createRecipe,
    toggleRecipeFavorite as apiToggleRecipeFavorite,
    deleteRecipe as apiDeleteRecipe,
    getPlannedMeals,
    createPlannedMeal,
    togglePlannedMeal,
    deletePlannedMeal,
    getGroceries,
    addGroceryItem as apiAddGroceryItem,
    addGroceryBatch,
    updateGroceryItem,
    deleteGroceryItem,
    clearBoughtGroceries,
} from "$api/meals";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export interface Cook {
    id: string | number;
    name: string;
    icon?: string;
    icon_bg?: string;
    icon_color?: string;
}

export interface PlannedMeal {
    id: string;
    date: string; // YYYY-MM-DD
    slot: MealSlot;
    title: string;
    prepTimeMinutes?: number;
    cook?: Cook;
    recipeId?: string;
    servings?: number;
    note?: string;
    isCompleted?: boolean;
}

export interface Ingredient {
    id: string;
    name: string;
    amount: number;
    unit: string;
    checked?: boolean;
}

export interface RecipeStep {
    number: number;
    text: string;
}

export interface Recipe {
    id: string;
    title: string;
    description: string;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    baseServings: number;
    category: "quick" | "favorites" | "kids" | "desserts" | "dinner" | string;
    tags: string[];
    isFavorite: boolean;
    accentGradient: string;
    emoji: string;
    ingredients: Ingredient[];
    steps: RecipeStep[];
}

export interface GroceryItem {
    id: string;
    name: string;
    amount?: number;
    unit?: string;
    checked: boolean;
    addedFromRecipe?: string;
    createdAt: number;
}

// ─── Normalizers (Backend Snake -> Frontend Model) ──────────────────────────

export function normalizeRecipe(r: any): Recipe {
    return {
        id: String(r.id),
        title: r.title || "",
        description: r.description || "",
        prepTimeMinutes: r.prep_time_minutes ?? r.prepTimeMinutes ?? 10,
        cookTimeMinutes: r.cook_time_minutes ?? r.cookTimeMinutes ?? 20,
        baseServings: r.base_servings ?? r.baseServings ?? 4,
        category: r.category || "quick",
        tags: Array.isArray(r.tags) ? r.tags : [],
        isFavorite: Boolean(r.is_favorite ?? r.isFavorite),
        accentGradient: r.accent_gradient || r.accentGradient || "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
        emoji: r.emoji || "🍲",
        ingredients: Array.isArray(r.ingredients)
            ? r.ingredients.map((ing: any, idx: number) => ({
                  id: ing.id ? String(ing.id) : `ing-${idx}`,
                  name: ing.name || "",
                  amount: ing.amount !== null && ing.amount !== undefined ? Number(ing.amount) : 0,
                  unit: ing.unit || "",
                  checked: Boolean(ing.checked),
              }))
            : [],
        steps: Array.isArray(r.steps)
            ? r.steps.map((st: any, idx: number) => ({
                  number: st.number ?? idx + 1,
                  text: typeof st === "string" ? st : st.text || "",
              }))
            : [],
    };
}

export function normalizePlannedMeal(m: any): PlannedMeal {
    let cookObj: Cook | undefined = undefined;
    if (m.cook) {
        const cookName = m.cook.name || "Член семьи";
        cookObj = {
            id: String(m.cook.id),
            name: cookName,
            icon: m.cook.icon || "material-symbols:person-rounded",
            icon_bg: m.cook.icon_bg || "#FFE8E0",
            icon_color: m.cook.icon_color || "#E06A47",
        };
    }

    return {
        id: String(m.id),
        date: typeof m.date === "string" ? m.date.slice(0, 10) : m.date,
        slot: m.slot as MealSlot,
        title: m.title || "",
        prepTimeMinutes: m.prep_time_minutes ?? m.prepTimeMinutes ?? 15,
        recipeId: m.recipe_id ? String(m.recipe_id) : m.recipeId ? String(m.recipeId) : undefined,
        servings: m.servings ?? 4,
        note: m.note ?? undefined,
        isCompleted: Boolean(m.is_completed ?? m.isCompleted),
        cook: cookObj,
    };
}

export function normalizeGroceryItem(g: any): GroceryItem {
    return {
        id: String(g.id),
        name: g.name || "",
        amount: g.amount !== null && g.amount !== undefined ? Number(g.amount) : undefined,
        unit: g.unit || "",
        checked: Boolean(g.is_bought ?? g.checked),
        addedFromRecipe: g.added_from_recipe || g.addedFromRecipe || undefined,
        createdAt: g.created_at ? new Date(g.created_at).getTime() : g.createdAt || Date.now(),
    };
}

// ─── Legacy Storage Purge (Remove hardcoded dummy data) ─────────────────────

if (typeof window !== "undefined") {
    try {
        localStorage.removeItem("family_recipes_hub_v1");
        localStorage.removeItem("family_planned_meals_v1");
        localStorage.removeItem("family_grocery_list_v1");

        const cachedRecipes = localStorage.getItem("swr:family-recipes");
        if (cachedRecipes && cachedRecipes.includes('"rec-1"')) {
            localStorage.removeItem("swr:family-recipes");
        }
    } catch {}
}

// ─── Shared Svelte Stores (Reactive In-Memory Mirrors) ───────────────────────

export const recipesStore = writable<Recipe[]>([]);
export const plannedMealsStore = writable<PlannedMeal[]>([]);
export const groceryStore = writable<GroceryItem[]>([]);

// ─── SWR Data Accessors ─────────────────────────────────────────────────────

export function useFamilyRecipes() {
    return swr<Recipe[]>("family-recipes", async () => {
        const res: any = await getRecipes();
        const list = (res.recipes || []).map(normalizeRecipe);
        recipesStore.set(list);
        return list;
    });
}

export function useWeeklyMealPlanner(startDate: string, endDate: string) {
    const key = `family-planned-meals:${startDate}:${endDate}`;
    return swr<PlannedMeal[]>(key, async () => {
        const res: any = await getPlannedMeals(startDate, endDate);
        const list = (res.meals || []).map(normalizePlannedMeal);
        plannedMealsStore.set(list);
        return list;
    });
}

export function useFamilyGroceries() {
    return swr<GroceryItem[]>("family-groceries", async () => {
        const res: any = await getGroceries();
        const list = (res.items || []).map(normalizeGroceryItem);
        groceryStore.set(list);
        return list;
    });
}

// ─── Store Actions (Backend API + SWR Sync) ─────────────────────────────────

export async function addCustomRecipe(recipe: any): Promise<Recipe> {
    const payload = {
        title: recipe.title,
        description: recipe.description || null,
        prep_time_minutes: recipe.prepTimeMinutes ?? 15,
        cook_time_minutes: recipe.cookTimeMinutes ?? 20,
        base_servings: recipe.baseServings ?? 4,
        category: recipe.category || "quick",
        tags: Array.isArray(recipe.tags) ? recipe.tags : [],
        is_favorite: Boolean(recipe.isFavorite),
        accent_gradient: recipe.accentGradient || "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
        emoji: recipe.emoji || "🍲",
        ingredients: (recipe.ingredients || []).map((i: any) => ({
            id: i.id || null,
            name: i.name,
            amount: i.amount !== "" && i.amount !== null && i.amount !== undefined ? parseFloat(String(i.amount)) : null,
            unit: i.unit || "",
            checked: false,
        })),
        steps: (recipe.steps || []).map((s: any) => ({
            number: s.number,
            text: s.text,
        })),
    };

    const res: any = await createRecipe(payload);
    const normalized = normalizeRecipe(res);
    recipesStore.update((list) => [normalized, ...list]);
    mutate("family-recipes");
    return normalized;
}

export async function toggleRecipeFavorite(recipeId: string): Promise<void> {
    recipesStore.update((list) =>
        list.map((r) => (r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r))
    );
    try {
        await apiToggleRecipeFavorite(recipeId);
    } catch (e) {
        console.error("Failed to toggle recipe favorite", e);
    }
    mutate("family-recipes");
}

export async function deleteCustomRecipe(recipeId: string): Promise<void> {
    recipesStore.update((list) => list.filter((r) => r.id !== recipeId));
    try {
        await apiDeleteRecipe(recipeId);
    } catch (e) {
        console.error("Failed to delete recipe", e);
    }
    mutate("family-recipes");
}

export async function addPlannedMeal(meal: Omit<PlannedMeal, "id">): Promise<PlannedMeal> {
    const payload: any = {
        date: meal.date,
        slot: meal.slot,
        title: meal.title,
        prep_time_minutes: meal.prepTimeMinutes || 15,
        servings: meal.servings || 4,
        note: meal.note || null,
        recipe_id: meal.recipeId || null,
        assigned_cook_id: meal.cook?.id ? String(meal.cook.id) : null,
    };

    const res: any = await createPlannedMeal(payload);
    const normalized = normalizePlannedMeal(res);
    plannedMealsStore.update((list) => [...list, normalized]);
    mutate("family-planned-meals*");
    mutate("planned-meals*");
    return normalized;
}

export async function removePlannedMeal(mealId: string): Promise<void> {
    plannedMealsStore.update((list) => list.filter((m) => m.id !== mealId));
    try {
        await deletePlannedMeal(mealId);
    } catch (e) {
        console.error("Failed to delete planned meal", e);
    }
    mutate("family-planned-meals*");
    mutate("planned-meals*");
}

export async function togglePlannedMealStatus(mealId: string): Promise<void> {
    plannedMealsStore.update((list) =>
        list.map((m) => (m.id === mealId ? { ...m, isCompleted: !m.isCompleted } : m))
    );
    try {
        await togglePlannedMeal(mealId);
    } catch (e) {
        console.error("Failed to toggle planned meal", e);
    }
    mutate("family-planned-meals*");
    mutate("planned-meals*");
}

export async function addGroceryItem(item: { name: string; amount?: number; unit?: string; category?: string }): Promise<GroceryItem> {
    const payload = {
        name: item.name,
        amount: item.amount ?? null,
        unit: item.unit || null,
        category: item.category || null,
    };

    const res: any = await apiAddGroceryItem(payload);
    const normalized = normalizeGroceryItem(res);
    groceryStore.update((list) => [normalized, ...list]);
    mutate("family-groceries");
    return normalized;
}

export async function addIngredientsToGrocery(
    ingredients: { name: string; amount?: number; unit?: string }[],
    recipeTitle?: string
): Promise<number> {
    const batch = ingredients.map((i) => ({
        name: i.name,
        amount: i.amount ?? null,
        unit: i.unit || null,
        category: "Рецепт",
        added_from_recipe: recipeTitle || null,
    }));

    await addGroceryBatch(batch);
    mutate("family-groceries");
    return batch.length;
}

export async function toggleGroceryItem(itemId: string, currentStatus?: boolean): Promise<void> {
    groceryStore.update((list) =>
        list.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i))
    );
    try {
        await updateGroceryItem(itemId, {
            is_bought: currentStatus !== undefined ? !currentStatus : true,
        });
    } catch (e) {
        console.error("Failed to toggle grocery item", e);
    }
    mutate("family-groceries");
}

export async function removeGroceryItem(itemId: string): Promise<void> {
    groceryStore.update((list) => list.filter((i) => i.id !== itemId));
    try {
        await deleteGroceryItem(itemId);
    } catch (e) {
        console.error("Failed to delete grocery item", e);
    }
    mutate("family-groceries");
}

export async function clearCompletedGrocery(): Promise<void> {
    groceryStore.update((list) => list.filter((i) => !i.checked));
    try {
        await clearBoughtGroceries();
    } catch (e) {
        console.error("Failed to clear bought groceries", e);
    }
    mutate("family-groceries");
}

// ─── Utility ────────────────────────────────────────────────────────────────

export function isRecipePlannedThisWeek(
    recipeId: string,
    currentWeekDates: string[],
    meals: PlannedMeal[]
): string | null {
    const found = meals.find((m) => m.recipeId === recipeId && currentWeekDates.includes(m.date));
    return found ? found.date : null;
}
