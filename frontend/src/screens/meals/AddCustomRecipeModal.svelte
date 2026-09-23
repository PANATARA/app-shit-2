<script lang="ts">
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import Icon from "@iconify/svelte";
    import { addCustomRecipe, type Recipe } from "$lib/mealsStore";
    import { registerModal } from "$lib/navigation";

    const dispatch = createEventDispatcher<{
        close: void;
        saved: Recipe;
    }>();

    let portal: HTMLDivElement;
    let unregisterModal: (() => void) | null = null;

    function handleClose() {
        dispatch("close");
    }

    onMount(() => {
        if (typeof document !== "undefined" && portal) {
            document.body.appendChild(portal);
            unregisterModal = registerModal(handleClose);
        }
    });

    onDestroy(() => {
        if (unregisterModal) {
            unregisterModal();
        }
        if (portal && portal.parentNode) {
            portal.parentNode.removeChild(portal);
        }
    });

    let title = "";
    let description = "";
    let category: "quick" | "dinner" | "kids" | "desserts" | "favorites" = "dinner";
    let prepTimeMinutes = 15;
    let cookTimeMinutes = 20;
    let baseServings = 4;
    let selectedEmoji = "🍲";
    let selectedEmojiCategory = "all";

    const emojiCategories = [
        {
            id: "all",
            label: "Все",
            emojis: [] as string[],
        },
        {
            id: "hot",
            label: "Горячее и супы",
            emojis: ["🍲", "🥣", "🍜", "🥘", "🫕", "🥟", "🍛", "🧆", "🫔"],
        },
        {
            id: "meat_fish",
            label: "Мясо и рыба",
            emojis: ["🥩", "🍗", "🍖", "🥓", "🌭", "🍢", "🐟", "🍣", "🍤", "🦞", "🦀", "🦑", "🦪"],
        },
        {
            id: "pasta_pizza",
            label: "Паста и гарниры",
            emojis: ["🍝", "🍕", "🍚", "🥔", "🍠", "🌽"],
        },
        {
            id: "breakfast",
            label: "Завтраки",
            emojis: ["🍳", "🥚", "🥞", "🧇", "🧀", "🥐", "🥯", "🥑"],
        },
        {
            id: "fastfood",
            label: "Стритфуд",
            emojis: ["🍔", "🥪", "🌮", "🌯", "🥙", "🍟", "🥨", "🥖", "🍞"],
        },
        {
            id: "salads_veg",
            label: "Салаты и овощи",
            emojis: ["🥗", "🥒", "🍅", "🥦", "🥕", "🫑", "🍆", "🧄", "🧅", "🍄"],
        },
        {
            id: "fruits",
            label: "Фрукты и ягоды",
            emojis: ["🍎", "🍏", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒", "🍑", "🥭", "🍍", "🥝"],
        },
        {
            id: "desserts",
            label: "Десерты",
            emojis: ["🥧", "🍰", "🎂", "🧁", "🍪", "🍩", "🍮", "🍨", "🍦", "🍫", "🍬", "🍭"],
        },
        {
            id: "drinks",
            label: "Напитки",
            emojis: ["☕", "🍵", "🧃", "🥤", "🥛", "🧋", "🫖", "🍹", "🍺"],
        },
    ];

    const allFoodEmojis = Array.from(
        new Set(emojiCategories.filter((c) => c.id !== "all").flatMap((c) => c.emojis))
    );

    $: displayedEmojis = selectedEmojiCategory === "all"
        ? allFoodEmojis
        : (emojiCategories.find((c) => c.id === selectedEmojiCategory)?.emojis || allFoodEmojis);

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
            handleClose();
        } catch (e: any) {
            console.error("Failed to save recipe", e);
            errorMessage = e?.message || "Не удалось сохранить рецепт на сервере";
            isSubmitting = false;
        }
    }
</script>

<div bind:this={portal} class="modal-portal">
    <div
        class="modal-backdrop"
        on:click={handleClose}
        on:keydown={(e) => e.key === "Escape" && handleClose()}
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
                <button class="close-btn" on:click={handleClose}>
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
                    <div class="emoji-header-row">
                        <div class="emoji-preview-box">
                            <span class="preview-emoji">{selectedEmoji}</span>
                        </div>
                        <div class="emoji-header-meta">
                            <span class="field-label">Иконка блюда</span>
                            <span class="emoji-hint">Нажмите на подходящую иконку</span>
                        </div>
                    </div>

                    <!-- Category Tabs -->
                    <div class="emoji-cat-tabs">
                        {#each emojiCategories as cat}
                            <button
                                type="button"
                                class="cat-tab-btn"
                                class:active={selectedEmojiCategory === cat.id}
                                on:click={() => (selectedEmojiCategory = cat.id)}
                            >
                                {cat.label}
                            </button>
                        {/each}
                    </div>

                    <!-- Emoji Grid -->
                    <div class="emoji-grid-container">
                        <div class="emoji-grid">
                            {#each displayedEmojis as em}
                                <button
                                    type="button"
                                    class="emoji-btn"
                                    class:active={selectedEmoji === em}
                                    on:click={() => (selectedEmoji = em)}
                                    aria-label="Выбрать эмодзи {em}"
                                >
                                    {em}
                                </button>
                            {/each}
                        </div>
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
                on:click={handleClose}
                disabled={isSubmitting}
            >
                Отменить
            </button>
            <button
                type="button"
                class="btn-save"
                on:click={handleSave}
                disabled={isSubmitting}
            >
                {#if isSubmitting}
                    <span>Создание...</span>
                {:else}
                    <Icon icon="material-symbols:add-rounded" width={20} height={20} />
                    <span>Создать</span>
                {/if}
            </button>
        </div>
    </div>
</div>
</div>

<style>
    .modal-portal {
        position: relative;
        z-index: 1000;
    }

    .modal-backdrop {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        height: 100dvh;
        max-width: 100%;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 1000;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
        overflow: hidden;
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
        max-height: 92vh;
        max-height: 92dvh;
        height: auto;
        overflow: hidden;
        box-sizing: border-box;
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .drag-handle-bar {
        display: flex;
        justify-content: center;
        padding-top: 10px;
        flex-shrink: 0;
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
        flex-shrink: 0;
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
        -webkit-overflow-scrolling: touch;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-sizing: border-box;
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
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

    .emoji-selector-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        box-sizing: border-box;
    }

    .emoji-header-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .emoji-preview-box {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        border: 2px solid var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 14px var(--accent-glow, rgba(232, 106, 71, 0.2));
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .preview-emoji {
        font-size: 26px;
        line-height: 1;
    }

    .emoji-header-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .emoji-hint {
        font-size: 11px;
        color: var(--text-muted);
    }

    .emoji-cat-tabs {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 2px;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        width: 100%;
        box-sizing: border-box;
    }

    .emoji-cat-tabs::-webkit-scrollbar {
        display: none;
    }

    .cat-tab-btn {
        padding: 5px 11px;
        border-radius: 999px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        transition: all 0.15s ease;
    }

    .cat-tab-btn:hover {
        color: var(--text-primary);
        border-color: var(--border);
    }

    .cat-tab-btn.active {
        background: var(--text-primary);
        color: var(--bg);
        border-color: var(--text-primary);
    }

    .emoji-grid-container {
        max-height: 168px;
        overflow-y: auto;
        padding: 6px 8px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        border-radius: 16px;
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
    }

    .emoji-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
        gap: 6px;
        width: 100%;
    }

    .emoji-btn {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s ease, border-color 0.15s ease;
        padding: 0;
        margin: 0;
    }

    .emoji-btn:hover {
        transform: scale(1.1);
        border-color: var(--accent);
    }

    .emoji-btn:active {
        transform: scale(0.95);
    }

    .emoji-btn.active {
        background: color-mix(in srgb, var(--accent) 18%, transparent);
        border-color: var(--accent);
        transform: scale(1.12);
        box-shadow: 0 2px 8px var(--accent-glow, rgba(232, 106, 71, 0.25));
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
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        padding-bottom: max(14px, env(safe-area-inset-bottom, 14px));
        border-top: 1px solid var(--border-subtle);
        background: var(--surface);
        box-sizing: border-box;
        width: 100%;
        flex-shrink: 0;
        position: sticky;
        bottom: 0;
        z-index: 10;
    }

    .btn-cancel {
        flex: 1;
        height: 48px;
        padding: 0 16px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-pill, 999px);
        color: var(--text-secondary);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        white-space: nowrap;
        transition: background-color 0.15s ease;
    }

    .btn-cancel:active {
        background: color-mix(in srgb, var(--surface-alt) 80%, black);
    }

    .btn-save {
        flex: 1.5;
        height: 48px;
        padding: 0 18px;
        background: var(--accent-gradient, var(--accent));
        border: none;
        border-radius: var(--radius-pill, 999px);
        color: #ffffff;
        font-size: 14px;
        font-weight: 700;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 0;
        white-space: nowrap;
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease;
    }

    .btn-save:active {
        transform: scale(0.97);
    }

    .btn-save:disabled,
    .btn-cancel:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
