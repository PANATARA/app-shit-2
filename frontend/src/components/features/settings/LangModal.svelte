<script lang="ts">
  import BottomSheet from "$ui/BottomSheet.svelte";
  import Icon from "@iconify/svelte";
  import { language as langStore } from "$lib/settings.js";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  const languages = [
    {
      code: "ru",
      nativeName: "Русский",
      englishName: "Russian",
      flag: "🇷🇺",
    },
    {
      code: "en",
      nativeName: "English",
      englishName: "English",
      flag: "🇬🇧",
    },
  ];

  function selectLanguage(code: string) {
    langStore.set(code);
    close();
  }

  function close() {
    dispatch("close");
  }
</script>

<BottomSheet
  title={$langStore === "ru" ? "Сменить язык" : "Change Language"}
  on:close={close}
  flyY={999}
  flyDuration={320}
>
  <div class="lang-container">
    <p class="intro-text">
      {#if $langStore === "ru"}
        Выберите язык интерфейса приложения. Изменения применятся мгновенно.
      {:else}
        Choose your preferred interface language. Changes will apply instantly.
      {/if}
    </p>

    <div class="languages-list">
      {#each languages as language}
        <button
          class="lang-card"
          class:selected={language.code === $langStore}
          on:click={() => selectLanguage(language.code)}
        >
          <div class="card-left">
            <div class="flag-badge">
              <span class="flag-emoji">{language.flag}</span>
            </div>

            <div class="text-block">
              <span class="lang-title">{language.nativeName}</span>
              {#if language.code !== $langStore}
                <span class="lang-subtitle">
                  {#if $langStore === "ru"}
                    {language.code === "ru" ? "Русский" : "Английский"}
                  {:else}
                    {language.englishName}
                  {/if}
                </span>
              {/if}
            </div>
          </div>

          <div class="selection-indicator">
            {#if language.code === $langStore}
              <div class="indicator-active">
                <Icon
                  icon="material-symbols:check-rounded"
                  width="16"
                  height="16"
                  class="check-icon"
                />
              </div>
            {:else}
              <div class="indicator-inactive"></div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
</BottomSheet>

<style>
  .lang-container {
    padding: 4px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .intro-text {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
    padding: 0 4px;
    opacity: 0.85;
  }

  .languages-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .lang-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 14px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Hover and active effects */
  /* .lang-card:hover {
    background: var(--surface-alt);
    border-color: var(--text-muted);
  } */

  .lang-card:active {
    transform: scale(0.985);
  }

  /* Selected State styles */
  .lang-card.selected {
    background: var(--accent-soft);
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(213, 138, 114, 0.12);
  }

  /* Light theme overlay support for soft accent text */
  :global(body.light) .lang-card.selected {
    box-shadow: 0 4px 12px rgba(201, 123, 99, 0.12);
  }

  .card-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  /* Beautiful Flag Badge Container */
  .flag-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    background: var(--surface-alt);
    border-radius: 12px;
    border: 1px solid var(--border);
    font-size: 24px;
    line-height: 1;
    transition: all 0.25s ease;
    flex-shrink: 0;
  }

  .lang-card.selected .flag-badge {
    background: var(--surface);
    border-color: var(--accent);
  }

  .flag-emoji {
    display: inline-block;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
    transform: translateZ(0); /* Hardware acceleration */
  }

  .text-block {
    display: flex;
    flex-direction: column;
  }

  .lang-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    transition: color 0.25s ease;
  }

  .lang-card.selected .lang-title {
    color: var(--text-primary);
  }

  .lang-subtitle {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 1px;
  }

  /* Custom styled Selection Indicator */
  .selection-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .indicator-active {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: var(--accent);
    border-radius: 50%;
    color: var(--bg);
    animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .indicator-inactive {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border);
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  /* .lang-card:hover .indicator-inactive {
    border-color: var(--text-muted);
  } */

  .check-icon {
    display: block;
    stroke-width: 2.5px;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.6);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
