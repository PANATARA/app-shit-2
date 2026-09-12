import { apiFetch } from "./client.js";

// ─── RECIPES ──────────────────────────────────────────────────────────

export async function getRecipes(category?: string, search?: string) {
    const params: Record<string, string> = {};
    if (category && category !== "all") params.category = category;
    if (search) params.search = search;
    return apiFetch("/api/meals/recipes", { params });
}

export async function createRecipe(recipeData: any) {
    return apiFetch("/api/meals/recipes", {
        method: "POST",
        body: recipeData,
    });
}

export async function getRecipeById(recipeId: string) {
    return apiFetch(`/api/meals/recipes/${recipeId}`);
}

export async function updateRecipe(recipeId: string, recipeData: any) {
    return apiFetch(`/api/meals/recipes/${recipeId}`, {
        method: "PATCH",
        body: recipeData,
    });
}

export async function toggleRecipeFavorite(recipeId: string) {
    return apiFetch(`/api/meals/recipes/${recipeId}/favorite`, {
        method: "POST",
    });
}

export async function deleteRecipe(recipeId: string) {
    return apiFetch(`/api/meals/recipes/${recipeId}`, {
        method: "DELETE",
    });
}

// ─── PLANNER ──────────────────────────────────────────────────────────

export async function getPlannedMeals(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return apiFetch("/api/meals/planner", { params });
}

export async function createPlannedMeal(mealData: any) {
    return apiFetch("/api/meals/planner", {
        method: "POST",
        body: mealData,
    });
}

export async function updatePlannedMeal(mealId: string, mealData: any) {
    return apiFetch(`/api/meals/planner/${mealId}`, {
        method: "PATCH",
        body: mealData,
    });
}

export async function togglePlannedMeal(mealId: string) {
    return apiFetch(`/api/meals/planner/${mealId}/toggle`, {
        method: "POST",
    });
}

export async function deletePlannedMeal(mealId: string) {
    return apiFetch(`/api/meals/planner/${mealId}`, {
        method: "DELETE",
    });
}

// ─── GROCERIES ────────────────────────────────────────────────────────

export async function getGroceries() {
    return apiFetch("/api/meals/groceries");
}

export async function addGroceryItem(itemData: any) {
    return apiFetch("/api/meals/groceries", {
        method: "POST",
        body: itemData,
    });
}

export async function addGroceryBatch(items: any[]) {
    return apiFetch("/api/meals/groceries/batch", {
        method: "POST",
        body: { items },
    });
}

export async function updateGroceryItem(itemId: string, itemData: any) {
    return apiFetch(`/api/meals/groceries/${itemId}`, {
        method: "PATCH",
        body: itemData,
    });
}

export async function deleteGroceryItem(itemId: string) {
    return apiFetch(`/api/meals/groceries/${itemId}`, {
        method: "DELETE",
    });
}

export async function clearBoughtGroceries() {
    return apiFetch("/api/meals/groceries", {
        method: "DELETE",
    });
}
