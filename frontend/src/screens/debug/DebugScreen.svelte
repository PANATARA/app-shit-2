<script lang="ts">
  import BottomSheet from "$ui/BottomSheet.svelte";
  import { showDays, theme, language } from "$lib/settings.js";
  import { t } from "$lib/i18n.js";
  import Icon from "@iconify/svelte";

  let notificationsEnabled = true;

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
</script>

<div class="page">
  <div class="section-label">{$t.settings.sections.general}</div>
  <div class="group">
    <button class="item" on:click={() => openSheet("lang")}>
      <div class="item-icon">
        <Icon icon="material-symbols:globe" width="24" height="24" />
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
        <Icon icon="material-symbols:contrast" width="24" height="24" />
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

    <div class="sep"></div>
    <div class="sep"></div>

    <div class="item">
      <div class="item-icon">
        <Icon
          icon="material-symbols:notifications-rounded"
          width="24"
          height="24"
        />
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
        <Icon
          icon="material-symbols:calendar-month-rounded"
          width="24"
          height="24"
        />
      </div>
      <span class="item-label">{$t.settings.fields.showWeekdays}</span>
      <label class="tog">
        <input type="checkbox" bind:checked={$showDays} />
        <span class="tog-track"><span class="tog-thumb"></span></span>
      </label>
    </div>
  </div>
</div>

<!-- Bottom sheet -->
{#if sheetVisible}
  <BottomSheet
    title={sheetType === "lang" ? "Язык" : "Оформление"}
    on:close={closeSheet}
  >
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
    {:else if sheetType === "theme"}
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
  </BottomSheet>
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
</style>
