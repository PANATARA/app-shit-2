<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";

  const dispatch = createEventDispatcher();

  export let initialIcon = "material-symbols:person-rounded";
  export let initialIconColor = "#ffffff";
  export let initialBg = "linear-gradient(135deg, #e8856a 0%, #c17a45 100%)";
  export let showActions = true;

  let selectedIcon = initialIcon;
  let selectedIconColor = initialIconColor;
  let selectedBg = initialBg;

  // ─── Icons ───────────────────────────────────────────────────────────────

  const iconCategories = [
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
        "material-symbols:baby-changing-station-rounded",
      ],
    },
    {
      label: "Животные",
      icons: [
        "material-symbols:pets",
        "fluent-emoji-high-contrast:cat-face",
        "fluent-emoji-high-contrast:dog-face",
        "material-symbols:cruelty-free",
        "fluent-emoji-high-contrast:rabbit-face",
        "fluent-emoji-high-contrast:bear",
        "fluent-emoji-high-contrast:panda",
        "fluent-emoji-high-contrast:fox",
        "fluent-emoji-high-contrast:hamster",
        "fluent-emoji-high-contrast:penguin",
        "fluent-emoji-high-contrast:frog",
        "fluent-emoji-high-contrast:owl",
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
        "material-symbols:ac-unit-rounded",
        "material-symbols:local-fire-department-rounded",
        "material-symbols:volcano-rounded",
        "material-symbols:mode-night-rounded",
        "material-symbols:star-rounded",
      ],
    },
    {
      label: "Еда",
      icons: [
        "material-symbols:restaurant-rounded",
        "material-symbols:local-pizza-rounded",
        "material-symbols:lunch-dining-rounded",
        "material-symbols:cake-rounded",
        "material-symbols:icecream-rounded",
        "material-symbols:coffee-rounded",
        "material-symbols:local-cafe-rounded",
        "material-symbols:bakery-dining",
        "material-symbols:ramen-dining-rounded",
        "material-symbols:set-meal-rounded",
        "material-symbols:local-bar-rounded",
        "material-symbols:emoji-food-beverage-rounded",
      ],
    },
    {
      label: "Активность",
      icons: [
        "material-symbols:sports-soccer-rounded",
        "material-symbols:sports-basketball-rounded",
        "material-symbols:sports-tennis-rounded",
        "material-symbols:sports-esports-rounded",
        "material-symbols:fitness-center-rounded",
        "material-symbols:directions-bike-rounded",
        "material-symbols:directions-run-rounded",
        "material-symbols:pool-rounded",
        "material-symbols:sports-martial-arts-rounded",
        "material-symbols:skateboarding-rounded",
        "material-symbols:music-note-rounded",
        "material-symbols:palette-rounded",
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
    "#ffffff",
    "#f5e6d3",
    "#ffd700",
    "#ff6b6b",
    "#ff9f43",
    "#48dbfb",
    "#1dd1a1",
    "#ff9ff3",
    "#a29bfe",
    "#fd79a8",
    "#00b894",
    "#2d3436",
    "#e17055",
    "#74b9ff",
    "#55efc4",
    "#fdcb6e",
  ];

  // ─── Backgrounds ─────────────────────────────────────────────────────────

  const bgOptions = [
    // градиенты тёплые
    "linear-gradient(135deg, #e8856a 0%, #c17a45 100%)",
    "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    // градиенты холодные
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    // градиенты тёмные
    "linear-gradient(135deg, #2d3436 0%, #636e72 100%)",
    "linear-gradient(135deg, #485563 0%, #29323c 100%)",
    "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",
    "linear-gradient(135deg, #200122 0%, #6f0000 100%)",
    "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
    // однотонные
    "#e8a87c",
    "#6ab8a0",
    "#e87c5a",
    "#a29bfe",
    "#fd79a8",
    "#00b894",
    "#0984e3",
    "#e17055",
    "#2d3436",
  ];

  // ─── Tabs ─────────────────────────────────────────────────────────────────

  let activeTab: "icon" | "iconColor" | "bg" = "icon";
  let activeCategoryIndex = 0;

  // ─── Computed ─────────────────────────────────────────────────────────────

  function handleSave() {
    dispatch("save", {
      icon: selectedIcon,
      icon_color: selectedIconColor,
      icon_bg: selectedBg,
    });
  }

  function handleCancel() {
    dispatch("cancel");
  }
</script>

<div class="constructor">
  <!-- Preview -->
  <div class="preview-wrap">
    <div class="preview-avatar" style="background: {selectedBg}">
      <Icon
        icon={selectedIcon}
        width="52"
        height="52"
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
          on:click={() => (activeCategoryIndex = i)}>{cat.label}</button
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

    <div class="custom-color-wrap">
      <span class="custom-label">Свой цвет</span>
      <input type="color" class="color-picker" bind:value={selectedIconColor} />
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

    <div class="custom-color-wrap">
      <span class="custom-label">Свой цвет</span>
      <input
        type="color"
        class="color-picker"
        value={selectedBg.startsWith("#") ? selectedBg : "#e8a87c"}
        on:input={(e) => (selectedBg = e.currentTarget.value)}
      />
    </div>
  {/if}

  <!-- Actions -->
  {#if showActions}
    <div class="actions">
      <button class="btn-cancel" on:click={handleCancel}>Отмена</button>
      <button class="btn-save" on:click={handleSave}>Сохранить</button>
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
    padding: 8px 0 4px;
  }

  .preview-avatar {
    width: 100px;
    height: 100px;
    border-radius: 28px;
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
    padding-bottom: 2px;
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
    grid-template-columns: repeat(5, minmax(0, 1fr));
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

  /* ── Custom color ───────────────────────── */
  .custom-color-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg, #2a2318);
    border-radius: 12px;
    padding: 10px 14px;
    margin-top: 4px;
  }

  .custom-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
  }

  .color-picker {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    padding: 2px;
    background: none;
  }

  /* ── Actions ───────────────────────── */
  .actions {
    display: flex;
    gap: 10px;
    padding-top: 4px;
  }

  .btn-cancel {
    flex: 1;
    padding: 13px;
    background: var(--bg, #2a2318);
    border: none;
    border-radius: 14px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-cancel:active {
    opacity: 0.7;
  }

  .btn-save {
    flex: 2;
    padding: 13px;
    background: var(--accent, #e8a87c);
    border: none;
    border-radius: 14px;
    color: #2a1800;
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-save:active {
    opacity: 0.8;
  }
</style>
