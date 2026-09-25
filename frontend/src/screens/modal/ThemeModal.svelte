<script lang="ts">
    import BottomSheet from "$ui/BottomSheet.svelte";
    import Icon from "@iconify/svelte";
    import { theme } from "$lib/settings.js";
    import { t } from "$lib/i18n";
    import { createEventDispatcher } from "svelte";
    import { get } from "svelte/store";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";

    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }

    let currentTheme = get(theme) || "warm";
    if (currentTheme === "sunset") currentTheme = "warm";
    if (currentTheme === "rose") currentTheme = "soft";
    let selectedTheme = currentTheme;

    $: themes = [
        {
            id: "warm",
            name: $t.modals.themeWarm || "Тёплый семейный уют",
            description: $t.modals.themeWarmDesc || "Светлая, тёплая и домашняя атмосфера",
            colors: ["#FAF7F2", "#E06A47", "#5A9E6F"],
        },
        {
            id: "soft",
            name: $t.modals.themeSoft || "Нежность и забота",
            description: $t.modals.themeSoftDesc || "Пастельные пудровые оттенки и гармония",
            colors: ["#FDF7F8", "#E25275", "#6B8AF0"],
        },
        {
            id: "night",
            name: $t.modals.themeNight || "Уютный вечер дома",
            description: $t.modals.themeNightDesc || "Мягкая тёмная тема для вечернего комфорта",
            colors: ["#17151B", "#221E27", "#FF9A6C"],
        },
        {
            id: "royal",
            name: $t.modals.themeRoyal || "Свежесть и гармония",
            description: $t.modals.themeRoyalDesc || "Чистая прохладная лазурная гамма",
            colors: ["#F2F8FC", "#2D72D9", "#0891B2"],
        },
        {
            id: "sage",
            name: $t.modals.themeSage || "Лесной оазис",
            description: $t.modals.themeSageDesc || "Успокаивающие шалфейные и травяные тона",
            colors: ["#F3F6F3", "#2E7D52", "#4E9F6A"],
        },
        {
            id: "midnight",
            name: $t.modals.themeMidnight || "Северное сияние",
            description: $t.modals.themeMidnightDesc || "Глубокая ночная гамма с акцентом индиго",
            colors: ["#0E121A", "#161C26", "#6366F1"],
        },
        {
            id: "amber",
            name: $t.modals.themeAmber || "Медовый полдень",
            description: $t.modals.themeAmberDesc || "Солнечная золотисто-янтарная гамма и тепло",
            colors: ["#FAF7EE", "#D97706", "#F59E0B"],
        },
    ];

    function applyTheme() {
        currentTheme = selectedTheme;
        theme.set(selectedTheme);
        close();
    }
</script>

<BottomSheet
    title={$t.modals.themeTitle}
    on:close={close}
    flyY={999}
    flyDuration={320}
>
    <div class="container">
        <div class="themes">
            {#each themes as t}
                <button
                    class="theme-card"
                    class:selected={t.id === selectedTheme}
                    onclick={() => (selectedTheme = t.id)}
                >
                    <div class="left">
                        <div class="preview">
                            {#each t.colors as color}
                                <span
                                    class="color"
                                    style="background: {color}"
                                ></span>
                            {/each}
                        </div>
                        <div class="text">
                            <div class="title">{t.name}</div>
                            <div class="subtitle">{t.description}</div>
                        </div>
                    </div>
                    <div class="selection">
                        {#if t.id === selectedTheme}
                            <div class="active">
                                <Icon
                                    icon="material-symbols:check-rounded"
                                    width={16}
                                />
                            </div>
                        {:else}
                            <div class="inactive"></div>
                        {/if}
                    </div>
                </button>
            {/each}
        </div>
    </div>

    <div class="actions">
        <ButtonPrimaryGlow
            on:click={applyTheme}
            label={$t.common.apply}
            disabled={selectedTheme === currentTheme}
            fullWidth
        />
    </div>
</BottomSheet>

<style>
    .container {
        padding: 4px 16px 16px;
    }

    .themes {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .theme-card {
        display: flex;
        justify-content: space-between;
        align-items: center;

        width: 100%;
        padding: 12px 14px;

        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: 20px;

        cursor: pointer;

        transition:
            transform 0.15s ease,
            border-color 0.2s ease,
            background 0.2s ease;
    }

    .theme-card:active {
        transform: scale(0.98);
    }

    .theme-card.selected {
        border-color: var(--accent);
        background: var(--accent-soft);
    }

    .left {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .preview {
        display: flex;
        align-items: center;
        gap: 3px;

        width: 56px;
        height: 40px;
        padding: 6px;

        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 12px;

        overflow: hidden;
    }

    .color {
        flex: 1;
        height: 100%;
        border-radius: 5px;
    }

    .text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        text-align: left;
    }

    .title {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .subtitle {
        font-size: 12px;
        color: var(--text-muted);
    }

    .selection {
        width: 24px;
        display: flex;
        justify-content: center;
        flex-shrink: 0;
    }

    .active {
        width: 22px;
        height: 22px;

        display: flex;
        align-items: center;
        justify-content: center;

        background: var(--accent);
        color: white;
        border-radius: 50%;
    }

    .inactive {
        width: 20px;
        height: 20px;
        border: 2px solid var(--border);
        border-radius: 50%;
    }

    .actions {
        padding: 0 16px 8px;
    }
</style>
