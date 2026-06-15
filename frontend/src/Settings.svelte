<script>
  import { fly } from "svelte/transition";
  import { icons } from "./lib/icons";
  import {
    showDays,
    theme,
    blur,
    materialYou,
    language,
  } from "./lib/settings.js";
  import { t } from './lib/i18n.js';

  
  

  let notificationsEnabled = true;
  // let selectedLanguage = "Русский";
  // let blur = false;

  // Bottom sheet state
  let sheetType = null; // 'lang' | 'theme'
  let sheetVisible = false;

  const languages = [
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
  ];
  const themes = ["Тёмное", "Светлое", "Системное"];

  $: currentThemeLabel = $theme === "light" ? "Светлое" : "Тёмное";

  function openSheet(type) {
    sheetType = type;
    sheetVisible = true;
  }
  function closeSheet() {
    sheetVisible = false;
  }

  function selectLanguage(code) {
    language.set(code);
    closeSheet();
  }
  function selectTheme(t) {
    theme.set(t === "Светлое" ? "light" : "dark");
    closeSheet();
  }

  // function toggleBlur() {
  //   blur.toggle();
  // }

  // function togglematerialYou() {
  //   materialYou.toggle();
  // }

  async function deleteData() {
    if (window.AndroidBridge) {
      const confirmed = await new Promise((resolve) => {
        window.onNativeResponse = (result) => {
          resolve(result);
          delete window.onNativeResponse;
        };
        window.AndroidBridge.showConfirmDialog(
          "Стереть все данные",
          "Вы действительно хотите удалить все данные?",
        );
      });
      if (confirmed) {
        await deleteAllData();
        window.location.reload();
      }
    } else {
      if (confirm("Вы действительно хотите удалить все данные?")) {
        await deleteAllData();
      }
    }
  }

  async function exportDataHandler() {
    console.log("export");
    await exportData();
  }

  async function importData() {
    console.log("import");
    await importDataFromFile();
  }

  // Поддерживает ли устройство Material You
  const systemSupported =
    !!window.AndroidBridge?.getMaterialYouColors &&
    (() => {
      try {
        return JSON.parse(window.AndroidBridge.getMaterialYouColors())
          .supported;
      } catch {
        return false;
      }
    })();
</script>

<div class="page">
  <div class="section-label">{$t.settings.sections.general}</div>

  <div class="group">
    <button class="item" on:click={() => openSheet("lang")}>
      <div class="item-icon">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 25 25"
          ><path d={icons.language} /></svg
        >
      </div>
      <span class="item-label">{$t.settings.fields.language}</span>
      <span class="item-val">
        {$language === "ru" ? "Русский" : "English"}
      </span>
      <svg
        class="chev"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#333"
        stroke-width="2.5"><path d="M9 18l6-6-6-6" /></svg
      >
    </button>

    <div class="sep"></div>

    <button class="item" on:click={() => openSheet("theme")}>
      <div class="item-icon">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 25 25"
          ><path d={icons.theme} /></svg
        >
      </div>
      <span class="item-label">{$t.settings.fields.appearance}</span>
      <span class="item-val">{currentThemeLabel}</span>
      <svg
        class="chev"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#333"
        stroke-width="2.5"><path d="M9 18l6-6-6-6" /></svg
      >
    </button>
    {#if systemSupported}
      <div class="sep"></div>
      <div class="sep"></div>

      <div class="item">
        <div class="item-icon">
          <svg
            height="24px"
            width="24px"
            fill="currentColor"
            viewBox="0 0 25 25"
          >
            <path
              d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67 0 1.38-1.12 2.5-2.5 2.5zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"
            /><circle cx="6.5" cy="11.5" r="1.5" /><circle
              cx="9.5"
              cy="7.5"
              r="1.5"
            /><circle cx="14.5" cy="7.5" r="1.5" /><circle
              cx="17.5"
              cy="11.5"
              r="1.5"
            />
          </svg>
        </div>
        <span class="item-label">Material You</span>
        <label class="tog">
          <input type="checkbox" bind:checked={$materialYou} />
          <span class="tog-track"><span class="tog-thumb"></span></span>
        </label>
      </div>
    {/if}

    <div class="sep"></div>
    <div class="sep"></div>

    <div class="item">
      <div class="item-icon">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 25 25"
          ><path d={icons.blur} /></svg
        >
      </div>
      <span class="item-label">{$t.settings.fields.blur}</span>
      <label class="tog">
        <input type="checkbox" bind:checked={$blur} />
        <span class="tog-track"><span class="tog-thumb"></span></span>
      </label>
    </div>

    <div class="sep"></div>
    <div class="sep"></div>

    <div class="item">
      <div class="item-icon">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 25 25"
          ><path d={icons.notification} /></svg
        >
      </div>
      <span class="item-label">{$t.settings.fields.notifications}</span>
      <label class="tog">
        <input type="checkbox" bind:checked={notificationsEnabled} />
        <span class="tog-track"><span class="tog-thumb"></span></span>
      </label>
    </div>

    <div class="sep"></div>
    <div class="sep"></div>

    <div class="item">
      <div class="item-icon">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 25 25"
          ><path d={icons.calendar} /></svg
        >
      </div>
      <span class="item-label">{$t.settings.fields.showWeekdays}</span>
      <label class="tog">
        <input type="checkbox" bind:checked={$showDays} />
        <span class="tog-track"><span class="tog-thumb"></span></span>
      </label>
    </div>
  </div>

  <div class="section-label">{$t.settings.sections.data}</div>

  <div class="group">
    <button class="item" on:click={() => openSheet("data")}>
      <div class="item-icon">
        <svg
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="currentColor"><path d={icons.download} /></svg
        >
      </div>
      <span class="item-label">{$t.settings.actions.importExport}</span>
      <svg
        class="chev"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#333"
        stroke-width="2.5"><path d="M9 18l6-6-6-6" /></svg
      >
    </button>

    <div class="sep"></div>
    <div class="sep"></div>

    <button class="item" on:click={deleteData}>
      <div class="item-icon" style="background:rgba(255,59,48,0.12);">
        <svg width="24" height="24" fill="#ff3b30" viewBox="0 0 25 25"
          ><path d={icons.trash} /></svg
        >
      </div>
      <span class="item-label" style="color:#ff3b30;">{$t.settings.actions.deleteAllData}</span>
    </button>
  </div>
</div>

<!-- Bottom sheet -->
{#if sheetVisible}
  <!-- Backdrop -->
  <div
    class="backdrop"
    role="button"
    tabindex="0"
    on:click={closeSheet}
    on:keydown={(e) => e.key === "Escape" && closeSheet()}
    transition:fly={{ duration: 200, opacity: 1 }}
  ></div>

  <!-- Sheet -->
  <div class="sheet" transition:fly={{ y: 300, duration: 280, opacity: 1 }}>
    <!-- Handle -->
    <div class="sheet-handle"></div>

    <!-- Title -->
    <div class="sheet-title">
      {sheetType === "lang"
        ? "Язык"
        : sheetType === "data"
          ? "Данные"
          : "Оформление"}
    </div>

    <!-- Options -->
    <div>
      {#if sheetType === "lang"}
        <div class="sheet-options">
          {#each languages as lang}
            <button
              class="sheet-option"
              class:active={$language === lang.code}
              on:click={() => selectLanguage(lang.code)}
            >
              <span>{lang.label}</span>

              {#if $language === lang.code}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      {:else if sheetType === "data"}
        <div class="data-options">
          <button
            class="data-card"
            on:click={() => {
              closeSheet();
              exportDataHandler(); // без await — запускается в фоне
            }}
          >
            <div class="data-card-icon">
              <svg
                height="28px"
                viewBox="0 -960 960 960"
                width="28px"
                fill="currentColor"
              >
                <path
                  d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"
                />
              </svg>
            </div>
            <div class="data-card-text">
              <span class="data-card-title">Экспорт данных</span>
              <span class="data-card-sub">Сохранить данные привычек в файл</span
              >
            </div>
          </button>

          <button
            class="data-card"
            on:click={() => {
              importData();
              // closeSheet();
            }}
          >
            <div class="data-card-icon">
              <svg
                height="28px"
                viewBox="0 -960 960 960"
                width="28px"
                fill="currentColor"
              >
                <path
                  d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"
                />
              </svg>
            </div>
            <div class="data-card-text">
              <span class="data-card-title">Импорт данных</span>
              <span class="data-card-sub"
                >Восстановить данные привычек из файла</span
              >
            </div>
          </button>
        </div>
      {:else}
        <div class="sheet-options">
          {#each themes as t}
            <button
              class="sheet-option"
              class:active={t === currentThemeLabel}
              on:click={() => selectTheme(t)}
            >
              <span>{t}</span>
              {#if t === currentThemeLabel}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"><path d="M20 6L9 17l-5-5" /></svg
                >
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Cancel -->
    <button class="sheet-cancel" on:click={closeSheet}>Отмена</button>
  </div>
{/if}

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .page {
    min-height: 100%;
    padding: 8px 16px 120px;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI",
      sans-serif;
    -webkit-font-smoothing: antialiased;
    color: var(--text-primary);
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 20px 4px 8px;
  }

  .group {
    background: var(--bg-card-deep);
    border-radius: 16px;
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }

  .sep {
    height: 0.5px;
    background: var(--divider);
    margin: 0 16px;
    flex-shrink: 0;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    background: transparent;
    border: none;
    width: 100%;
    color: inherit;
    font-family: inherit;
    font-size: 15px;
    text-align: left;
    cursor: pointer;
    min-height: 48px;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.1s;
    border-radius: 15px;
  }
  .item:active {
    background: var(--bg-input);
  }

  .item-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--bg-icon);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .item-label {
    flex: 1;
    font-size: 15px;
    color: var(--text-primary);
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-val {
    font-size: 14px;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .chev {
    flex-shrink: 0;
  }

  /* Toggle */
  .tog {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    flex-shrink: 0;
  }
  .tog input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .tog-track {
    width: 42px;
    height: 24px;
    background: var(--accent-container);
    border-radius: 12px;
    position: relative;
    transition: background 0.22s;
    display: block;
  }
  .tog input:checked + .tog-track {
    background: var(--accent);
  }
  .tog-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    display: block;
  }
  .tog input:checked + .tog-track .tog-thumb {
    transform: translateX(18px);
  }

  /* Backdrop */
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  /* Sheet */
  .sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 101;
    background: var(--bg);
    border-radius: 20px 20px 0 0;
    padding: 0 0 max(24px, env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
  }

  .sheet-handle {
    width: 36px;
    height: 4px;
    background: var(--text-muted);
    border-radius: 2px;
    margin: 12px auto 0;
    flex-shrink: 0;
  }

  .sheet-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    text-align: center;
    padding: 14px 16px 8px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .sheet-options {
    display: flex;
    flex-direction: column;
    margin: 0 16px;
    background: var(--bg-card-deep);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
  }

  .sheet-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    background: transparent;
    border: none;
    border-bottom: 0.5px solid var(--border);
    color: var(--text-primary);
    font-size: 16px;
    font-family: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.1s;
  }
  .sheet-option:last-child {
    border-bottom: none;
  }
  .sheet-option:active {
    background: var(--bg-input);
  }
  .sheet-option.active {
    color: var(--accent);
  }

  .sheet-cancel {
    margin: 12px 16px 0;
    padding: 16px;
    background: var(--bg-card);
    border: none;
    border-radius: 14px;
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.1s;
  }
  .sheet-cancel:active {
    background: var(--bg-card-deep);
  }
  .data-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0 16px;
  }

  .data-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--bg-card-deep);
    border: 1px solid var(--border);
    border-radius: 16px;
    color: var(--text-primary);
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.1s;
    width: 100%;
  }

  .data-card:active {
    background: var(--bg-input);
  }

  .data-card-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: var(--bg-icon);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .data-card-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .data-card-title {
    font-size: 16px;
    font-weight: 600;
  }

  .data-card-sub {
    font-size: 13px;
    color: var(--text-muted);
  }
</style>
