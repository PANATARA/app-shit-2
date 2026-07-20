<script lang="ts">
    import BottomSheet from "$ui/BottomSheet.svelte";
    import Icon from "@iconify/svelte";
    import { theme } from "$lib/settings.js";
    import { createEventDispatcher } from "svelte";
    import { get } from "svelte/store";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }

    let currentTheme = get(theme) || "warm";
    let selectedTheme = currentTheme;

    const themes = [
        {
            id: "warm",
            name: "Тёплая",
            description: "Уютные бежевые оттенки",
            colors: ["#D58A72", "#F4E7DD", "#A85D49"],
        },
        {
            id: "lavender",
            name: "Лаванда",
            description: "Мягкие фиолетовые оттенки",
            colors: ["#9C6ADE", "#D1C4E9", "#6A1B9A"],
        },
        {
            id: "sunset",
            name: "Закат",
            description: "Тёплые розово-малиновые оттенки",
            colors: ["#1a1015", "#f472b6", "#fb923c"],
        },
        {
            id: "midnight",
            name: "Полночь",
            description: "Глубокий синий с индиго акцентом",
            colors: ["#070b14", "#6366f1", "#22d3ee"],
        },
        {
            id: "amber",
            name: "Янтарь",
            description: "Тёплый золотисто-коричневый",
            colors: ["#14100a", "#f59e0b", "#84cc16"],
        },
    ];

    function selectTheme(id: string) {
        selectedTheme = id;
    }

    function applyTheme() {
        currentTheme = selectedTheme;
        theme.set(selectedTheme);

        close();
    }
</script>

<BottomSheet
    title="Тема приложения"
    on:close={close}
    flyY={999}
    flyDuration={320}
>
    <div class="container">
        <p class="intro">
            Выберите цветовую тему приложения. Изменения применяются сразу.
        </p>

        <div class="themes">
            {#each themes as t}
                <button
                    class="theme-card"
                    class:selected={t.id === selectedTheme}
                    on:click={() => selectTheme(t.id)}
                >
                    <div class="left">
                        <div class="preview">
                            {#each t.colors as color}
                                <span
                                    class="color"
                                    style={`background:${color}`}
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
                                    width="16"
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
            label={"Применить"}
            disabled={selectedTheme === currentTheme}
            fullWidth
        />
    </div>
</BottomSheet>

<style>
    .container {
        padding: 4px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .intro {
        margin: 0;
        font-size: 13px;
        color: var(--text-secondary);
        opacity: 0.85;
        line-height: 1.5;
        padding: 0 4px;
    }

    .themes {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .theme-card {
        display: flex;
        justify-content: space-between;
        align-items: center;

        width: 100%;
        padding: 12px 14px;

        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: 16px;

        cursor: pointer;
        transition: 0.25s;
    }

    .theme-card:active {
        transform: scale(0.985);
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
        gap: 4px;

        width: 56px;
        height: 42px;
        padding: 6px;

        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 12px;
    }

    .color {
        flex: 1;
        height: 100%;
        border-radius: 6px;
    }

    .text {
        display: flex;
        flex-direction: column;
    }

    .title {
        font-size: 15px;
        font-weight: 600;
    }

    .subtitle {
        margin-top: 2px;
        font-size: 12px;
        color: var(--text-muted);
    }

    .selection {
        width: 24px;
        display: flex;
        justify-content: center;
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
        /*margin-top: 20px;*/
        padding: 10px;
    }
</style>
