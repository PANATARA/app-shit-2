<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import { addCustomRecipe, type Recipe } from "$lib/mealsStore";

    const dispatch = createEventDispatcher<{
        close: void;
        saved: Recipe;
    }>();

    let title = "";
    let description = "";
    let category: "quick" | "dinner" | "kids" | "desserts" | "favorites" = "dinner";
    let prepTimeMinutes = 15;
    let cookTimeMinutes = 20;
    let baseServings = 4;
    let selectedEmoji = "🍲";

    const emojiChoices = ["🍲", "🍝", "🍕", "🥞", "🥣", "🥗", "🥩", "🥧", "🍛", "🍣", "🥪", "🍰", "🍔", "🌮", "🍮", "🍪"];

    const categoryChoices: { id: typeof category; label: string }[] = [
        { id: "quick", label: "Быстро" },
        { id: "dinner", label: "Ужин" },
        { id: "kids", label: "Детям" },
        { id: "desserts", label: "Десерты" },
    ];

    interface IngredientInput {
        name: string;
        amount: string;
        unit: string;
    }

    let ingredients: IngredientInput[] = [
        { name: "", amount: "", unit: "г" },
    ];

    let steps: string[] = [""];

    let isSubmitting = false;
    let errorMessage = "";

    function addIngredientRow() {
        ingredients = [...ingredients, { name: "", amount: "", unit: "г" }];
    }

    function removeIngredientRow(index: number) {
        if (ingredients.length > 1) {
            ingredients = ingredients.filter((_, i) => i !== index);
        }
    }

    function addStepRow() {
        steps = [...steps, ""];
    }

    function removeStepRow(index: number) {
        if (steps.length > 1) {
            steps = steps.filter((_, i) => i !== index);
        }
    }

    async function handleSave() {
        if (!title.trim()) {
            errorMessage = "Пожалуйста, укажите название блюда";
            return;
        }

        isSubmitting = true;
        errorMessage = "";

        const validIngredients = ingredients
            .filter((i) => i.name.trim())
            .map((i, idx) => ({
                id: `ing-${idx + 1}`,
                name: i.name.trim(),
                amount: parseFloat(i.amount) || 0,
                unit: i.unit.trim() || "шт",
            }));

        const validSteps = steps
            .filter((s) => s.trim())
            .map((text, idx) => ({
                number: idx + 1,
                text: text.trim(),
            }));

        const recipePayload = {
            title: title.trim(),
            description: description.trim(),
            prepTimeMinutes: Number(prepTimeMinutes) || 10,
            cookTimeMinutes: Number(cookTimeMinutes) || 15,
            baseServings: Number(baseServings) || 4,
            category,
            tags: [categoryChoices.find((c) => c.id === category)?.label || "Своё"],
            isFavorite: false,
            emoji: selectedEmoji,
            accentGradient: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            ingredients: validIngredients,
            steps: validSteps,
        };

        try {
            const saved = await addCustomRecipe(recipePayload);
            isSubmitting = false;
            dispatch("saved", saved);
            dispatch("close");
        } catch (e: any) {
            console.error("Failed to save recipe", e);
            errorMessage = e?.message || "Не удалось сохранить рецепт на сервере";
            isSubmitting = false;
        }
    }
</script>

<div
    class="modal-backdrop"
    on:click={() => dispatch("close")}
    on:keydown={(e) => e.key === "Escape" && dispatch("close")}
    role="button"
    tabindex="0"
>
    <div
        class="sheet-container"
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <!-- Sheet Handle -->
        <div class="drag-handle-bar">
            <div class="drag-pill"></div>
        </div>

        <!-- Header -->
        <div class="sheet-header">
            <div>
                <h2 class="sheet-title">Новое блюдо</h2>
                <span class="sheet-subtitle">Добавление рецепта в семейную книгу</span>
            </div>
            <button class="close-btn" on:click={() => dispatch("close")}>
                <Icon icon="material-symbols:close-rounded" width={20} height={20} />
            </button>
        </div>

        <!-- Sheet Scroll Body -->
        <div class="sheet-body">
            {#if errorMessage}
                <div class="error-banner">{errorMessage}</div>
            {/if}

            <!-- Emoji Selector & Title -->
            <div class="main-info-group">
                <div class="emoji-selector-section">
                    <span class="field-label">Иконка блюда</span>
                    <div class="emoji-strip">
                        {#each emojiChoices as em}
                            <button
                                type="button"
                                class="emoji-btn"
                                class:active={selectedEmoji === em}
                                on:click={() => (selectedEmoji = em)}
                            >
                                {em}
                            </button>
                        {/each}
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label" for="dish-title">Название блюда *</label>
                    <input
                        id="dish-title"
                        type="text"
                        class="text-input"
                        placeholder="Например: Мамин борщ с пампушками"
                        bind:value={title}
                    />
                </div>

                <div class="field-group">
                    <label class="field-label" for="dish-desc">Описание или семейный секрет</label>
                    <textarea
                        id="dish-desc"
                        class="textarea-input"
                        placeholder="Почему это блюдо особенное для вашей семьи..."
                        rows="2"
                        bind:value={description}
                    ></textarea>
                </div>
            </div>

            <!-- Category Selection -->
            <div class="field-group">
                <span class="field-label">Категория</span>
                <div class="chips-wrap">
                    {#each categoryChoices as c}
                        <button
                            type="button"
                            class="category-chip"
                            class:active={category === c.id}
                            on:click={() => (category = c.id)}
                        >
                            {c.label}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Servings & Times -->
            <div class="servings-time-row">
                <div class="field-group">
                    <span class="field-label">Порции</span>
                    <div class="stepper-wrap">
                        <button
                            type="button"
                            class="step-btn"
                            on:click={() => (baseServings = Math.max(1, baseServings - 1))}
                            aria-label="Уменьшить количество порций"
                        >
                            -
                        </button>
                        <span class="stepper-val">{baseServings}</span>
                        <button
                            type="button"
                            class="step-btn"
                            on:click={() => (baseServings = baseServings + 1)}
                            aria-label="Увеличить количество порций"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label" for="prep-time">Подготовка</label>
                    <div class="time-input-wrap">
                        <input
                            id="prep-time"
                            type="number"
                            min="0"
                            class="text-input time-input"
                            bind:value={prepTimeMinutes}
                        />
                        <span class="time-unit">мин</span>
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label" for="cook-time">Варка</label>
                    <div class="time-input-wrap">
                        <input
                            id="cook-time"
                            type="number"
                            min="0"
                            class="text-input time-input"
                            bind:value={cookTimeMinutes}
                        />
                        <span class="time-unit">мин</span>
                    </div>
                </div>
            </div>

            <!-- Ingredients Builder -->
            <div class="builder-section">
                <div class="section-title-row">
                    <span class="field-label">Ингредиенты</span>
                    <button type="button" class="add-row-btn" on:click={addIngredientRow}>
                        <Icon icon="material-symbols:add-rounded" width={16} />
                        <span>Добавить продукт</span>
                    </button>
                </div>

                <div class="rows-list">
                    {#each ingredients as ing, i}
                        <div class="ing-row">
                            <input
                                type="text"
                                class="text-input ing-name"
                                placeholder="Ингредиент (напр. Сливки)"
                                bind:value={ing.name}
                            />
                            <input
                                type="text"
                                class="text-input ing-amount"
                                placeholder="Кол-во"
                                bind:value={ing.amount}
                            />
                            <input
                                type="text"
                                class="text-input ing-unit"
                                placeholder="г / мл / шт"
                                bind:value={ing.unit}
                            />
                            {#if ingredients.length > 1}
                                <button
                                    type="button"
                                    class="row-del-btn"
                                    on:click={() => removeIngredientRow(i)}
                                >
                                    <Icon icon="material-symbols:delete-outline-rounded" width={18} />
                                </button>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Steps Builder -->
            <div class="builder-section">
                <div class="section-title-row">
                    <span class="field-label">Шаги приготовления</span>
                    <button type="button" class="add-row-btn" on:click={addStepRow}>
                        <Icon icon="material-symbols:add-rounded" width={16} />
                        <span>Добавить шаг</span>
                    </button>
                </div>

                <div class="rows-list">
                    {#each steps as step, i}
                        <div class="step-row">
                            <span class="step-num">{i + 1}</span>
                            <textarea
                                class="textarea-input step-text"
                                rows="2"
                                placeholder="Опишите действие (напр. Разогрейте духовку до 180°C)..."
                                bind:value={steps[i]}
                            ></textarea>
                            {#if steps.length > 1}
                                <button
                                    type="button"
                                    class="row-del-btn"
                                    on:click={() => removeStepRow(i)}
                                >
                                    <Icon icon="material-symbols:delete-outline-rounded" width={18} />
                                </button>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="sheet-footer">
            <button
                type="button"
                class="btn-cancel"
                on:click={() => dispatch("close")}
                disabled={isSubmitting}
            >
                Отмена
            </button>
            <button
                type="button"
                class="btn-save"
                on:click={handleSave}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Сохранение..." : "Сохранить в книгу рецептов"}
            </button>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        width: 100vw;
        max-width: 100%;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 999;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    .sheet-container {
        width: 100%;
        max-width: 540px;
        background: var(--surface);
        border-radius: 28px 28px 0 0;
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-modal);
        display: flex;
        flex-direction: column;
        max-height: 90vh;
        overflow-x: hidden;
        overflow-y: hidden;
        box-sizing: border-box;
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .drag-handle-bar {
        display: flex;
        justify-content: center;
        padding-top: 10px;
    }

    .drag-pill {
        width: 36px;
        height: 4px;
        background: var(--border-subtle);
        border-radius: 999px;
    }

    .sheet-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        border-bottom: 1px solid var(--border-subtle);
        box-sizing: border-box;
        width: 100%;
    }

    .sheet-title {
        font-size: 19px;
        font-weight: 800;
        letter-spacing: -0.4px;
        margin: 0;
        color: var(--text-primary);
    }

    .sheet-subtitle {
        font-size: 12px;
        color: var(--text-muted);
    }

    .close-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
    }

    .sheet-body {
        padding: 14px 14px 20px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-sizing: border-box;
        width: 100%;
    }

    .error-banner {
        padding: 10px 14px;
        border-radius: 12px;
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
        font-size: 13px;
        font-weight: 600;
        width: 100%;
        box-sizing: border-box;
    }

    .main-info-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        box-sizing: border-box;
    }

    .field-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }

    .field-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: var(--text-muted);
    }

    .text-input,
    .textarea-input {
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        border-radius: 14px;
        padding: 11px 12px;
        color: var(--text-primary);
        font-size: 14px;
        font-family: inherit;
        outline: none;
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .text-input:focus,
    .textarea-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
    }

    .emoji-strip {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 4px 2px 6px;
        max-width: 100%;
        width: 100%;
        box-sizing: border-box;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
    }

    .emoji-strip::-webkit-scrollbar {
        display: none;
    }

    .emoji-btn {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .emoji-btn.active {
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        border-color: var(--accent);
        transform: scale(1.1);
    }

    .chips-wrap {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        width: 100%;
        box-sizing: border-box;
    }

    .category-chip {
        padding: 7px 12px;
        border-radius: 999px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .category-chip.active {
        background: var(--accent-gradient, var(--accent));
        color: #ffffff;
        border-color: transparent;
    }

    /* Servings & Time Row */
    .servings-time-row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr);
        gap: 8px;
        align-items: flex-end;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }

    @media (max-width: 390px) {
        .servings-time-row {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }
        .servings-time-row .field-group:first-child {
            grid-column: span 2;
        }
    }

    .stepper-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        border-radius: 14px;
        padding: 2px 4px;
        width: fit-content;
        box-sizing: border-box;
    }

    .step-btn {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .stepper-val {
        font-size: 15px;
        font-weight: 800;
        color: var(--text-primary);
        min-width: 24px;
        text-align: center;
    }

    .time-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        min-width: 0;
    }

    .time-input {
        padding-right: 32px !important;
        text-align: center;
        width: 100%;
        min-width: 0;
    }

    .time-unit {
        position: absolute;
        right: 8px;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        pointer-events: none;
    }

    /* Builders */
    .builder-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }

    .section-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }

    .add-row-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
        color: var(--accent);
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
    }

    .rows-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }

    .ing-row {
        display: flex;
        gap: 6px;
        align-items: center;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }

    .ing-name {
        flex: 1 1 0%;
        min-width: 0;
    }

    .ing-amount {
        flex: 0 0 60px;
        width: 60px;
        min-width: 0;
        text-align: center;
        padding-left: 4px !important;
        padding-right: 4px !important;
    }

    .ing-unit {
        flex: 0 0 54px;
        width: 54px;
        min-width: 0;
        text-align: center;
        padding-left: 4px !important;
        padding-right: 4px !important;
    }

    .step-row {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }

    .step-num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        font-size: 11px;
        font-weight: 800;
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 8px;
    }

    .step-text {
        flex: 1 1 0%;
        min-width: 0;
        width: 100%;
    }

    .row-del-btn {
        width: 32px;
        height: 38px;
        border-radius: 10px;
        background: rgba(239, 68, 68, 0.1);
        border: none;
        color: #ef4444;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex: 0 0 32px;
        flex-shrink: 0;
    }

    .sheet-footer {
        display: flex;
        gap: 10px;
        padding: 12px 14px 20px;
        border-top: 1px solid var(--border-subtle);
        box-sizing: border-box;
        width: 100%;
    }

    .btn-cancel {
        flex: 1;
        padding: 13px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        border-radius: 999px;
        color: var(--text-muted);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        min-width: 0;
    }

    .btn-save {
        flex: 2;
        padding: 13px;
        background: var(--accent-gradient, var(--accent));
        border: none;
        border-radius: 999px;
        color: #ffffff;
        font-size: 14px;
        font-weight: 700;
        box-shadow: var(--shadow-floating);
        cursor: pointer;
        min-width: 0;
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .btn-save:active {
        transform: scale(0.97);
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
</style>
