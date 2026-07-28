<script lang="ts">
    import Icon from "@iconify/svelte";
    import { createEventDispatcher } from "svelte";

    export let initialIcon = "material-symbols:person-rounded";
    export let initialIconColor = "#ffffff";
    export let initialBg = "linear-gradient(135deg, #e8856a 0%, #c17a45 100%)";

    let selectedIcon = initialIcon;
    let selectedIconColor = initialIconColor;
    let selectedBg = initialBg;

    // ─── Icons ───────────────────────────────────────────────────────────────

    const iconCategories = [
      {
          "label": "Домашние животные",
          "icons": [
              "emojione:dog-face",
              "emojione:cat-face",
              "emojione:hamster-face",
              "emojione:rabbit-face",
              "emojione:fox-face",
              "emojione:pig-face",
              "emojione:mouse-face",
              "emojione:horse-face",
              "emojione:bird",
              "emojione:duck",
              "emojione:rooster",
              "emojione:chicken",
              "emojione:hatching-chick",
              "emojione:lady-beetle",
              "emojione:snail",
              "emojione:fish",
              "emojione:tropical-fish",
              "emojione:blowfish",
              "emojione:turtle",
              "emojione:crocodile",
              "emojione:snake",
              "emojione:dragon-face",
              "emojione:lizard",
              "emojione:spider",
              "emojione:scorpion",
              "emojione:monkey-face",
              "emojione:elephant",
              "fa6-solid:dog",
              "fa6-solid:cat",
              "fa6-solid:horse",
              "fa6-solid:fish",
              "fa6-solid:spider",
              "fa6-solid:hippo",
              "fa6-solid:otter",
              "fa6-solid:worm",

          ]
      },
        {
            label: "Дом",
            icons: [
                "material-symbols:house-rounded",
                "material-symbols:bed-rounded",
                "material-symbols:ac-unit-rounded",
                "material-symbols:electric-bolt-rounded",
                "material-symbols:chair-rounded",
                "material-symbols:coffee-rounded",
                "material-symbols:checkroom-rounded",
                "material-symbols:mode-fan-rounded",
                "material-symbols:shower-rounded",
                "material-symbols:mop-rounded",
                "material-symbols:thermometer-rounded",
                "material-symbols:kitchen-rounded",
                "material-symbols:styler-rounded",
                "material-symbols:yard-rounded",
                "material-symbols:bathtub-rounded",
                "material-symbols:king-bed-rounded",
                "material-symbols:valve-rounded",
                "material-symbols:window-rounded",
                "material-symbols:cooking-rounded",
                "material-symbols:door-front-rounded",
                "material-symbols:garage-rounded",
                "material-symbols:light-rounded",
                "material-symbols:dining-rounded",
                "material-symbols:hardware-rounded",
                "material-symbols:microwave-rounded",
                "material-symbols:oven-gen-rounded",
                "material-symbols:bathroom-rounded",
                "material-symbols:table-bar-rounded",
                "material-symbols:sprinkler-rounded",
                "material-symbols:fire-extinguisher-rounded",
                "material-symbols:iron-rounded",
                "material-symbols:sensor-door-rounded",
                "material-symbols:dishwasher-gen-rounded",
                "material-symbols:faucet-rounded",
                "material-symbols:fence-rounded",
                "material-symbols:dresser-rounded",
                "material-symbols:kettle-rounded",
                "material-symbols:stroller-rounded",
                "material-symbols:multicooker-rounded",
                "material-symbols:health-and-beauty-rounded",
                "material-symbols:vacuum-rounded",
                "material-symbols:oven-rounded",
                "material-symbols:pets-rounded",
                "material-symbols:raven-rounded",
                "material-symbols:pet-supplies-rounded",
            ],
        },
        {
          "label": "Люди и Аватарки",
          "icons": [
            "material-symbols:person-rounded",
            "material-symbols:face",
            "material-symbols:face-2",
            "material-symbols:face-3",
            "material-symbols:face-4",
            "material-symbols:face-5",
            "material-symbols:face-6",
            "material-symbols:boy-rounded",
            "material-symbols:girl-rounded",
            "material-symbols:elderly-rounded",
            "material-symbols:elderly-woman-rounded",
            "material-symbols:baby-changing-station-rounded",
            "material-symbols:account-circle",
            "material-symbols:account-circle-rounded",
            "material-symbols:face-2-rounded",
            "material-symbols:face-3-rounded",
            "material-symbols:face-4-rounded",
            "material-symbols:face-5-rounded",
            "material-symbols:face-6-rounded",
            "material-symbols:face-down",
            "material-symbols:face-up",
            "material-symbols:face-nod",
            "material-symbols:face-shake",
            "material-symbols:face-left",
            "material-symbols:face-right",
            "material-symbols:face-left-outline",
            "material-symbols:face-right-outline",
            "material-symbols:face-left-outline-rounded",
            "material-symbols:face-right-outline-rounded",
            "material-symbols:person-2-rounded",
            "material-symbols:person-3-rounded",
            "material-symbols:person-4-rounded",
            "material-symbols:person-5-rounded",
            "material-symbols:person-6-rounded"
          ]
        },
        {
            label: "Природа",
            icons: [
                "material-symbols:eco-rounded",
                "material-symbols:local-florist-rounded",
                "material-symbols:forest-rounded",
                "material-symbols:grass-rounded",
                "material-symbols:water-drop-rounded",
                "material-symbols:wb-sunny-rounded",
                "material-symbols:thunderstorm-rounded",
                "material-symbols:ac-unit-rounded",
                "material-symbols:local-fire-department-rounded",
                "material-symbols:volcano-rounded",
                "material-symbols:mode-night-rounded",
                "material-symbols:star-rounded",
            ],
        },
        {
            label: "Разное",
            icons: [
                "material-symbols:home-rounded",
                "material-symbols:favorite-rounded",
                "material-symbols:bolt-rounded",
                "material-symbols:rocket-launch-rounded",
                "material-symbols:diamond-rounded",
                "material-symbols:emoji-events",
                "material-symbols:auto-awesome-rounded",
                "material-symbols:wb-incandescent-rounded",
                "material-symbols:local-activity-rounded",
                "material-symbols:attractions-rounded",
                "material-symbols:toys",
                "material-symbols:savings-rounded",
            ],
        },
    ];

    // ─── Icon colors ─────────────────────────────────────────────────────────

    const iconColors = [
        "#FFFFFF",
        "#F5E9DA",
        "#FFD166",
        "#FF6B6B",
        "#FF8A5B",
        "#4CC9F0",
        "#2DD4BF",
        "#C77DFF",
        "#A29BFE",
        "#F472B6",
        "#22C55E",
        "#2F2F2F",
        "#E76F51",
        "#60A5FA",
        "#34D399",
        "#FBBF24",
    ];

    // ─── Backgrounds ─────────────────────────────────────────────────────────

    const bgOptions = [
        "linear-gradient(135deg, #F97316 0%, #FB7185 100%)",
        "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
        "linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)",
        "linear-gradient(135deg, #FBBF24 0%, #FB923C 100%)",
        "linear-gradient(135deg, #FCA5A5 0%, #F59E0B 100%)",

        "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
        "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
        "linear-gradient(135deg, #A5B4FC 0%, #6366F1 100%)",
        "linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)",
        "linear-gradient(135deg, #34D399 0%, #60A5FA 100%)",

        "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        "linear-gradient(135deg, #111827 0%, #374151 100%)",
        "linear-gradient(135deg, #1C1917 0%, #292524 100%)",
        "linear-gradient(135deg, #0B1220 0%, #111827 100%)",
        "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",

        "#F59E0B",
        "#FB7185",
        "#60A5FA",
        "#34D399",
        "#A78BFA",
        "#F472B6",
        "#38BDF8",
        "#F97316",
        "#F5E9DA",
    ];

    // ─── Tabs ─────────────────────────────────────────────────────────────────

    let activeTab: "icon" | "iconColor" | "bg" = "icon";
    let activeCategoryIndex = 0;
    const dispatch = createEventDispatcher();
    $: dispatch("change", {
        icon: selectedIcon,
        icon_color: selectedIconColor,
        icon_bg: selectedBg,
    });
</script>

<div class="constructor">
    <!-- Preview -->
    <div class="preview-wrap">
        <div class="preview-avatar" style="background: {selectedBg}">
            <Icon
                icon={selectedIcon}
                width="55"
                height="55"
                color={selectedIconColor}
            />
        </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
        <button
            class="tab"
            class:tab-active={activeTab === "icon"}
            on:click={() => (activeTab = "icon")}>Иконка</button
        >
        <button
            class="tab"
            class:tab-active={activeTab === "iconColor"}
            on:click={() => (activeTab = "iconColor")}>Цвет иконки</button
        >
        <button
            class="tab"
            class:tab-active={activeTab === "bg"}
            on:click={() => (activeTab = "bg")}>Фон</button
        >
    </div>

    <!-- Icon picker -->
    {#if activeTab === "icon"}
        <div class="category-scroll">
            {#each iconCategories as cat, i}
                <button
                    class="category-btn"
                    class:category-active={activeCategoryIndex === i}
                    on:click={() => (activeCategoryIndex = i)}
                    >{cat.label}</button
                >
            {/each}
        </div>

        <div class="icon-grid">
            {#each iconCategories[activeCategoryIndex].icons as icon}
                <button
                    class="icon-cell"
                    class:icon-cell-active={selectedIcon === icon}
                    on:click={() => (selectedIcon = icon)}
                >
                    <Icon
                        {icon}
                        width="26"
                        height="26"
                        color={selectedIcon === icon
                            ? "var(--accent, #e8a87c)"
                            : "rgba(255,255,255,0.6)"}
                    />
                </button>
            {/each}
        </div>

        <!-- Icon color picker -->
    {:else if activeTab === "iconColor"}
        <div class="color-grid">
            {#each iconColors as color}
                <button
                    class="color-cell"
                    class:color-cell-active={selectedIconColor === color}
                    style="background: {color}; {color === '#ffffff'
                        ? 'border: 1.5px solid rgba(255,255,255,0.2)'
                        : ''}"
                    on:click={() => (selectedIconColor = color)}
                >
                    {#if selectedIconColor === color}
                        <Icon
                            icon="material-symbols:check-rounded"
                            width="16"
                            height="16"
                            color={color === "#ffffff" ||
                            color === "#f5e6d3" ||
                            color === "#ffd700"
                                ? "#333"
                                : "#fff"}
                        />
                    {/if}
                </button>
            {/each}
        </div>

        <!-- Background picker -->
    {:else}
        <div class="bg-grid">
            {#each bgOptions as bg}
                <button
                    class="bg-cell"
                    class:bg-cell-active={selectedBg === bg}
                    style="background: {bg}"
                    on:click={() => (selectedBg = bg)}
                >
                    {#if selectedBg === bg}
                        <Icon
                            icon="material-symbols:check-rounded"
                            width="16"
                            height="16"
                            color="#fff"
                        />
                    {/if}
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .constructor {
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
    }

    /* ── Preview ───────────────────────────── */
    .preview-wrap {
        display: flex;
        justify-content: center;
        padding: 0px 0 4px;
    }

    .preview-avatar {
        width: 100px;
        height: 100px;
        border-radius: 99px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    /* ── Tabs ───────────────────────────── */
    .tabs {
        display: flex;
        gap: 0;
        background: var(--bg, #2a2318);
        border-radius: 14px;
        padding: 4px;
        margin-bottom: 10px;
    }

    .tab {
        flex: 1;
        padding: 8px 4px;
        border: none;
        border-radius: 11px;
        background: none;
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
    }

    .tab-active {
        background: var(--bg-card, #332a1e);
        color: var(--accent, #e8a87c);
    }

    /* ── Category scroll ───────────────────────── */
    .category-scroll {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
        padding-bottom: 10px;
        justify-content: center;
    }

    .category-scroll::-webkit-scrollbar {
        display: none;
    }

    .category-btn {
        flex-shrink: 0;
        padding: 6px 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        background: none;
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.45);
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
    }

    .category-active {
        background: rgba(232, 168, 124, 0.15);
        border-color: var(--accent, #e8a87c);
        color: var(--accent, #e8a87c);
    }

    /* ── Icon grid ───────────────────────── */
    .icon-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 8px;
        width: 100%;
    }

    .icon-cell {
        aspect-ratio: 1;
        border-radius: 12px;
        background: var(--bg, #2a2318);
        border: 1.5px solid transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
        padding: 0;
    }

    .icon-cell:active {
        opacity: 0.7;
    }

    .icon-cell-active {
        border-color: var(--accent, #e8a87c);
        background: rgba(232, 168, 124, 0.1);
    }

    /* ── Color grid ───────────────────────── */
    .color-grid {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 8px;
        width: 100%;
    }

    .color-cell {
        aspect-ratio: 1;
        border-radius: 10px;
        border: 2px solid transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: transform 0.15s;
    }

    .color-cell:active {
        transform: scale(0.9);
    }

    .color-cell-active {
        border-color: #fff;
        transform: scale(1.1);
    }

    /* ── Background grid ───────────────────────── */
    .bg-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 8px;
        width: 100%;
    }

    .bg-cell {
        aspect-ratio: 1;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: transform 0.15s;
    }

    .bg-cell:active {
        transform: scale(0.9);
    }

    .bg-cell-active {
        border-color: #fff;
        transform: scale(1.05);
    }
</style>
