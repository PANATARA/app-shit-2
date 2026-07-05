<script lang="ts">
  import BottomSheet from "$ui/BottomSheet.svelte";
  import Icon from "@iconify/svelte";
  import { theme as themeStore } from "$lib/settings.js";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }

  let currentTheme = "warm";
  let selectedTheme = currentTheme;

  const themes = [
    {
      id: "warm",
      name: "Тёплая",
      description: "Уютные бежевые оттенки",
      colors: ["#D58A72", "#F4E7DD", "#A85D49"],
    },
    {
      id: "forest",
      name: "Лес",
      description: "Спокойные зелёные оттенки",
      colors: ["#4CAF50", "#A5D6A7", "#2E7D32"],
    },
    {
      id: "ocean",
      name: "Океан",
      description: "Холодные синие оттенки",
      colors: ["#2196F3", "#90CAF9", "#1565C0"],
    },
    {
      id: "lavender",
      name: "Лаванда",
      description: "Мягкие фиолетовые оттенки",
      colors: ["#9C6ADE", "#D1C4E9", "#6A1B9A"],
    },
  ];

  function selectTheme(id: string) {
    selectedTheme = id;
  }

  function applyTheme() {
    currentTheme = selectedTheme;
    themeStore.set(selectedTheme);
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
      {#each themes as theme}
        <button
          class="theme-card"
          class:selected={theme.id === selectedTheme}
          on:click={() => selectTheme(theme.id)}
        >
          <div class="left">
            <div class="preview">
              {#each theme.colors as color}
                <span class="color" style={`background:${color}`}></span>
              {/each}
            </div>

            <div class="text">
              <div class="title">{theme.name}</div>
              <div class="subtitle">{theme.description}</div>
            </div>
          </div>

          <div class="selection">
            {#if theme.id === currentTheme}
              <div class="active">
                <Icon icon="material-symbols:check-rounded" width="16" />
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
    <button
      class="apply"
      disabled={selectedTheme === currentTheme}
      on:click={applyTheme}
    >
      <Icon icon="material-symbols:check-rounded" width="18" />
      Применить
    </button>
  </div>
</BottomSheet>3

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

  .theme-card:hover {
    background: var(--surface-alt);
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
    margin-top: 10px;
  }

  .apply {
    width: 100%;
    height: 48px;

    border: none;
    border-radius: 16px;

    background: var(--accent);
    color: white;

    font-size: 15px;
    font-weight: 600;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    cursor: pointer;

    transition: all 0.2s ease;
  }

  .apply:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  .apply:active:not(:disabled) {
    transform: scale(0.98);
  }

  .apply:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>
