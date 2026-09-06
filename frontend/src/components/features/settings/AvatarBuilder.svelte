<script lang="ts">
    import Icon from "@iconify/svelte";

    // ─── Props ────────────────────────────────────────────────────────────────

    interface Props {
        initialIcon?: string;
        initialIconColor?: string;
        initialBg?: string;
        allowIcon?: boolean;
        allowIconColor?: boolean;
        allowBg?: boolean;
        iconCategories?: string[];
        onchange?: (value: {
            icon: string;
            icon_color: string;
            icon_bg: string;
        }) => void;
    }

    let {
        initialIcon = "material-symbols:person-rounded",
        initialIconColor = "#ffffff",
        initialBg = "linear-gradient(135deg, #e8856a 0%, #c17a45 100%)",
        allowIcon = true,
        allowIconColor = true,
        allowBg = true,
        iconCategories = undefined,
        onchange,
    }: Props = $props();

    // ─── All data ─────────────────────────────────────────────────────────────

    const ALL_ICON_CATEGORIES = [
        {
            label: "Питомцы",
            icons: [
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
            ],
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
                "material-symbols:iron-rounded",
                "material-symbols:dishwasher-gen-rounded",
                "material-symbols:faucet-rounded",
                "material-symbols:dresser-rounded",
                "material-symbols:kettle-rounded",
                "material-symbols:vacuum-rounded",
                "material-symbols:oven-rounded",
                "material-symbols:pets-rounded",
            ],
        },
        {
            label: "Люди",
            icons: [
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
                "material-symbols:account-circle-rounded",
                "material-symbols:face-2-rounded",
                "material-symbols:face-3-rounded",
                "material-symbols:face-4-rounded",
                "material-symbols:face-5-rounded",
                "material-symbols:face-6-rounded",
                "material-symbols:person-2-rounded",
                "material-symbols:person-3-rounded",
                "material-symbols:person-4-rounded",
            ],
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
                "material-symbols:local-fire-department-rounded",
                "material-symbols:volcano-rounded",
                "material-symbols:mode-night-rounded",
                "material-symbols:star-rounded",
            ],
        },
        {
            label: "Разное",
            icons: [
                "material-symbols:favorite-rounded",
                "material-symbols:bolt-rounded",
                "material-symbols:rocket-launch-rounded",
                "material-symbols:diamond-rounded",
                "material-symbols:emoji-events",
                "material-symbols:auto-awesome-rounded",
                "material-symbols:wb-incandescent-rounded",
                "material-symbols:local-activity-rounded",
                "material-symbols:savings-rounded",
            ],
        },
    ];

    const ALL_ICON_COLORS = [
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

    const ALL_BG_OPTIONS = [
        // ── Градиенты тёплые ──
        "linear-gradient(135deg, #F97316 0%, #FB7185 100%)",
        "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
        "linear-gradient(135deg, #FBBF24 0%, #FB923C 100%)",
        "linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)",
        "linear-gradient(135deg, #FCA5A5 0%, #F59E0B 100%)",
        "linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)",
        "linear-gradient(135deg, #FDA4AF 0%, #F43F5E 100%)",
        "linear-gradient(135deg, #FF8C42 0%, #FF3C38 100%)",
        "linear-gradient(135deg, #FDBA74 0%, #FB7185 100%)",

        // ── Градиенты холодные ──
        "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
        "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
        "linear-gradient(135deg, #A5B4FC 0%, #6366F1 100%)",
        "linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)",
        "linear-gradient(135deg, #34D399 0%, #60A5FA 100%)",
        "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)",
        "linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)",
        "linear-gradient(135deg, #A5F3FC 0%, #6366F1 100%)",
        "linear-gradient(135deg, #5EEAD4 0%, #0EA5E9 100%)",

        // ── Градиенты зелёные ──
        "linear-gradient(135deg, #86EFAC 0%, #22C55E 100%)",
        "linear-gradient(135deg, #4ADE80 0%, #16A34A 100%)",
        "linear-gradient(135deg, #BBF7D0 0%, #34D399 100%)",
        "linear-gradient(135deg, #A7F3D0 0%, #059669 100%)",

        // ── Градиенты тёмные ──
        "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        "linear-gradient(135deg, #111827 0%, #374151 100%)",
        "linear-gradient(135deg, #1C1917 0%, #292524 100%)",
        "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
        "linear-gradient(135deg, #134E4A 0%, #0F172A 100%)",
        "linear-gradient(135deg, #3B0764 0%, #1E1B4B 100%)",

        // ── Базовые цвета ──
        "#F59E0B",
        "#F97316",
        "#EF4444",
        "#FB7185",
        "#F472B6",
        "#A78BFA",
        "#8B5CF6",
        "#6366F1",
        "#60A5FA",
        "#38BDF8",
        "#22D3EE",
        "#34D399",
        "#4ADE80",
        "#22C55E",
        "#84CC16",
        "#FACC15",
        "#94A3B8",
        "#64748B",
        "#1E293B",
        "#0F172A",
        "#FFFFFF",
        "#F8FAFC",
        "#F1F5F9",
        "#FEF9EE",
        "#FFF7ED",
    ];

    const TAB_LABELS = {
        icon: "Иконка",
        iconColor: "Цвет",
        bg: "Фон",
    } as const;

    // ─── State ────────────────────────────────────────────────────────────────

    let selectedIcon = $state(initialIcon);
    let selectedIconColor = $state(initialIconColor);
    let selectedBg = $state(initialBg);
    let activeCategoryIndex = $state(0);

    // ─── Derived ──────────────────────────────────────────────────────────────

    const filteredCategories = $derived(
        iconCategories
            ? ALL_ICON_CATEGORIES.filter((c) =>
                  iconCategories!.includes(c.label),
              )
            : ALL_ICON_CATEGORIES,
    );

    const availableTabs = $derived(
        (
            [
                allowIcon && "icon",
                allowIconColor && "iconColor",
                allowBg && "bg",
            ] as const
        ).filter(Boolean) as Array<"icon" | "iconColor" | "bg">,
    );

    let activeTab = $state<"icon" | "iconColor" | "bg">("icon");

    // Синхронизируем activeTab с availableTabs
    $effect(() => {
        if (!availableTabs.includes(activeTab)) {
            activeTab = availableTabs[0];
        }
    });

    // Безопасный индекс категории
    const safeIndex = $derived(
        activeCategoryIndex < filteredCategories.length
            ? activeCategoryIndex
            : 0,
    );

    const currentIcons = $derived(filteredCategories[safeIndex]?.icons ?? []);

    // Эмитим изменения наружу
    $effect(() => {
        onchange?.({
            icon: selectedIcon,
            icon_color: selectedIconColor,
            icon_bg: selectedBg,
        });
    });

    function isLightColor(color: string) {
        return ["#FFFFFF", "#F5E9DA", "#FFD166"].includes(color);
    }
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

    <!-- Tabs — только если вкладок больше одной -->
    {#if availableTabs.length > 1}
        <div class="tabs">
            {#each availableTabs as tab}
                <button
                    class="tab"
                    class:tab-active={activeTab === tab}
                    onclick={() => (activeTab = tab)}
                >
                    {TAB_LABELS[tab]}
                </button>
            {/each}
        </div>
    {/if}

    <!-- Icon picker -->
    {#if activeTab === "icon"}
        {#if filteredCategories.length > 1}
            <div class="category-scroll">
                {#each filteredCategories as cat, i}
                    <button
                        class="category-btn"
                        class:category-active={activeCategoryIndex === i}
                        onclick={() => (activeCategoryIndex = i)}
                    >
                        {cat.label}
                    </button>
                {/each}
            </div>
        {/if}

        <div class="icon-grid">
            {#each currentIcons as icon}
                <button
                    class="icon-cell"
                    class:icon-cell-active={selectedIcon === icon}
                    onclick={() => (selectedIcon = icon)}
                >
                    <Icon
                        {icon}
                        width="26"
                        height="26"
                        color={selectedIcon === icon
                            ? "var(--accent)"
                            : "var(--text-muted)"}
                    />
                </button>
            {/each}
        </div>
    {:else if activeTab === "iconColor"}
        <div class="color-grid">
            {#each ALL_ICON_COLORS as color}
                <button
                    class="color-cell"
                    class:color-cell-active={selectedIconColor === color}
                    style="background: {color}; {color === '#FFFFFF'
                        ? 'border: 1.5px solid rgba(0,0,0,0.12)'
                        : ''}"
                    onclick={() => (selectedIconColor = color)}
                >
                    {#if selectedIconColor === color}
                        <Icon
                            icon="material-symbols:check-rounded"
                            width="16"
                            height="16"
                            color={isLightColor(color) ? "#333" : "#fff"}
                        />
                    {/if}
                </button>
            {/each}
        </div>
    {:else if activeTab === "bg"}
        <div class="bg-grid">
            {#each ALL_BG_OPTIONS as bg}
                <button
                    class="bg-cell"
                    class:bg-cell-active={selectedBg === bg}
                    style="background: {bg}"
                    onclick={() => (selectedBg = bg)}
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

    .preview-wrap {
        display: flex;
        justify-content: center;
        padding: 4px 0 16px;
    }

    .preview-avatar {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
    }

    .tabs {
        display: flex;
        background: var(--surface-alt);
        border-radius: 14px;
        padding: 4px;
        margin-bottom: 12px;
        width: 100%;
        box-sizing: border-box;
    }

    .tab {
        flex: 1;
        min-width: 0;
        padding: 8px 4px;
        border: none;
        border-radius: 11px;
        background: none;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tab-active {
        background: var(--surface);
        color: var(--accent);
    }

    .category-scroll {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
        padding: 0 0 10px 0;
    }

    .category-scroll::-webkit-scrollbar {
        display: none;
    }

    .category-btn {
        flex-shrink: 0;
        padding: 6px 14px;
        border: 1px solid var(--border);
        border-radius: 20px;
        background: none;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
        white-space: nowrap;
    }

    .category-active {
        background: var(--accent-soft);
        border-color: var(--accent);
        color: var(--accent);
    }

    .icon-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 6px;
        width: 100%;
        box-sizing: border-box;
    }

    .icon-cell {
        aspect-ratio: 1;
        border-radius: 12px;
        background: var(--surface-alt);
        border: 1.5px solid transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
        padding: 0;
        min-width: 0;
        overflow: hidden;
    }

    .icon-cell:active {
        opacity: 0.7;
    }

    .icon-cell-active {
        border-color: var(--accent);
        background: var(--accent-soft);
    }

    .color-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 8px;
        width: 100%;
        box-sizing: border-box;
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
        min-width: 0;
    }

    .color-cell:active {
        transform: scale(0.9);
    }

    .color-cell-active {
        border-color: var(--text-primary);
        transform: scale(1.1);
    }

    .bg-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 8px;
        width: 100%;
        box-sizing: border-box;
    }

    .bg-cell {
        aspect-ratio: 1;
        border-radius: 12px;
        border: 1.5px solid rgba(0, 0, 0, 0.08);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: transform 0.15s;
        min-width: 0;
        outline: none;
    }

    .bg-cell:active {
        transform: scale(0.9);
    }

    .bg-cell-active {
        border-color: var(--text-primary);
        transform: scale(1.05);
    }
</style>
