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

    let currentTheme = get(theme) || "sunset";
    let selectedTheme = currentTheme;

    $: themes = [
        {
            id: "sunset",
            name: $t.modals.themeSunset,
            description: $t.modals.themeSunsetDesc,
            colors: ["#fdf6ee", "#e05c3a", "#5a9e6f"],
        },
        {
            id: "rose",
            name: $t.modals.themeRose,
            description: $t.modals.themeRoseDesc,
            colors: ["#cce8f4", "#c2185b", "#0277bd"],
        },
        {
            id: "royal",
            name: $t.modals.themeRoyal,
            description: $t.modals.themeRoyalDesc,
            colors: ["#dff7ff", "#2457ff", "#0891b2"],
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
