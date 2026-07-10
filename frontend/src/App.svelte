<script lang="ts">
  import { onMount } from "svelte";
  import BoardScreen from "$screens/app/BoardScreen.svelte";
  import StatsScreen from "$screens/app/StatsScreen.svelte";
  import ProfileSettingsScreen from "$screens/app/ProfileSettingsScreen.svelte";
  import DebugScreen from "$screens/debug/DebugScreen.svelte";

  import AuthScreen from "$screens/onBoarding/AuthScreen.svelte";
  import FamilyEntryScreen from "$screens/onBoarding/FamilyEntryScreen.svelte";

  import { t } from "$lib/i18n.js";
  import Icon from "@iconify/svelte";
  import { isLoggedInStore, clearTokens } from "$api/client.js";
  import { getProfile } from "$api/me.js";

  let isAuthed = false;
  let isInFamily = false;
  let checkingAuth = true;

  const screenTitle: Record<string, string> = {
    statsScreen: "Обзор",
    boardScreen: "Домашние дела",
    settingsScreen: "Настройки",
    debugScreen: "Debug",
  };

  let activeTab = "boardScreen";
  let selectedHabit = null;

  onMount(async () => {
    if ($isLoggedInStore) {
      await checkProfile();
    }
    checkingAuth = false;

    window.onAndroidBack = () => {
      if (selectedHabit) {
        closeDetail();
      } else if (activeTab !== "habits") {
        activeTab = "habits";
      } else {
        (window as any).AndroidBridge?.finish?.();
      }
    };

    return () => {
      window.onAndroidBack = null;
    };
  });

  async function checkProfile() {
    try {
      console.log("calling getProfile...");
      const profile = await getProfile();
      console.log("profile:", profile);
      isAuthed = true;
      isInFamily = !!profile.is_family_member;
    } catch (err) {
      console.warn("checkProfile failed:", err);
      clearTokens();
      isAuthed = false;
      isInFamily = false;
    }
  }

  async function handleAuth() {
    console.log("handleAuth called, isLoggedInStore:", $isLoggedInStore);
    checkingAuth = true;
    await checkProfile();
    console.log(
      "after checkProfile, isAuthed:",
      isAuthed,
      "isInFamily:",
      isInFamily,
    );
    checkingAuth = false;
  }

  function handleFamilySuccess() {
    isInFamily = true;
  }

  function closeDetail() {
    selectedHabit = null;
  }
</script>

<main>
  {#if checkingAuth}
    <div class="app-loading">
      <div class="app-spinner"></div>
      <p style="margin: 0; font-size: 15px; font-weight: 500;">
        Проверка авторизации...
      </p>
    </div>
  {:else if !isAuthed}
    <AuthScreen on:auth={handleAuth} />
  {:else if !isInFamily}
    <FamilyEntryScreen on:success={handleFamilySuccess} />
  {:else}
    {#if !selectedHabit}
      <header class="top-bar">
        <h1>{screenTitle[activeTab]}</h1>
      </header>
    {/if}

    <div class="content" class:no-topbar={!!selectedHabit}>
      {#if activeTab === "statsScreen"}
        <StatsScreen />
      {:else if activeTab === "boardScreen"}
        <BoardScreen />
      {:else if activeTab === "settingsScreen"}
        <ProfileSettingsScreen />
      {:else if activeTab === "debugScreen"}
        <DebugScreen />
      {/if}
    </div>

    <div class="nav-wrapper">
      <nav class="bottom-nav">
        <button
          class="nav-item"
          on:click={() => (activeTab = "statsScreen")}
          class:active={activeTab === "statsScreen"}
        >
          <Icon
            icon="material-symbols:bar-chart-rounded"
            width="24"
            height="24"
          />
        </button>

        <button
          class="nav-item plus-btn"
          on:click={() => (activeTab = "boardScreen")}
          class:active={activeTab === "boardScreen"}
        >
          <span class="icon">
            <Icon
              icon="material-symbols:calendar-check"
              width="24"
              height="24"
            />
          </span>
        </button>

        <button
          class="nav-item"
          on:click={() => (activeTab = "settingsScreen")}
          class:active={activeTab === "settingsScreen"}
          aria-label="Settings"
        >
          <span class="icon">
            <Icon
              icon="material-symbols:settings-rounded"
              width="24"
              height="24"
            />
          </span>
        </button>
        <!-- <button
          class="nav-item"
          on:click={() => (activeTab = "debugScreen")}
          class:active={activeTab === "debugScreen"}
          aria-label="Debug"
        >
          <span class="icon">
            <Icon icon="material-symbols:bug-report" width="24" height="24" />
          </span>
        </button> -->
      </nav>
    </div>
  {/if}
</main>

<style>
  /* ── CSS переменные: тёмная тема (default) ── */
  :global(body.warm) {
    /* Backgrounds */
    --bg: #2b2622;
    --surface: #35302b;
    --surface-alt: #413a34;
    --bg-bar: rgba(53, 48, 43);

    /* Text */
    --text: #f2ebe3;
    --text-primary: #f2ebe3;
    --text-secondary: #c0b3a6;
    --text-muted: #8f8378;
    --text-nav: #c0b3a6;

    /* Brand */
    --accent: #d58a72;
    --accent-soft: #5a4037;

    /* Success */
    --success: #95b5a0;
    --success-soft: #39473d;

    /* UI */
    --border: #494039;
    --divider: #433b35;

    /* Navigation */
    --bg-nav: #35302b;
    --nav-active-bg: rgba(213, 138, 114);
    --nav-active-fg: #f2ebe3;
    --shadow-nav: 0 10px 30px rgba(0, 0, 0, 0.25);

    /* Effects */
    --shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    --blur-effect: none;
  }

  /* ─── OCEAN ──────────────────────────────────────────────── */
  :global(body.ocean) {
    --bg: #0d1b2a;
    --surface: #112236;
    --surface-alt: #162d45;
    --bg-bar: rgba(17, 34, 54, 0.9);

    --text: #e0f0ff;
    --text-primary: #e0f0ff;
    --text-secondary: #93c5e8;
    --text-muted: #5a8aaa;
    --text-nav: #93c5e8;

    --accent: #38bdf8;
    --accent-soft: #0c2a3d;

    --success: #34d399;
    --success-soft: #0d2e24;

    --border: #1a3a55;
    --divider: #152f45;

    --bg-nav: #112236;
    --nav-active-bg: rgba(56, 189, 248, 0.2);
    --nav-active-fg: #e0f0ff;
    --shadow-nav: 0 10px 30px rgba(0, 0, 0, 0.4);

    --shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    --blur-effect: none;
  }

  /* ─── LAVENDER ───────────────────────────────────────────── */
  :global(body.lavender) {
    --bg: #16101f;
    --surface: #1e1530;
    --surface-alt: #261c3d;
    --bg-bar: rgba(30, 21, 48, 0.9);

    --text: #ede8f5;
    --text-primary: #ede8f5;
    --text-secondary: #c4b8e0;
    --text-muted: #8a7aaa;
    --text-nav: #c4b8e0;

    --accent: #a78bfa;
    --accent-soft: #241a3a;

    --success: #6ee7b7;
    --success-soft: #0f2820;

    --border: #302248;
    --divider: #271a3e;

    --bg-nav: #1e1530;
    --nav-active-bg: rgba(167, 139, 250, 0.2);
    --nav-active-fg: #ede8f5;
    --shadow-nav: 0 10px 30px rgba(0, 0, 0, 0.4);

    --shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    --blur-effect: none;
  }

  /* ─── SUNSET ─────────────────────────────────────────────── */
  :global(body.sunset) {
    --bg: #1a1015;
    --surface: #251520;
    --surface-alt: #301a28;
    --bg-bar: rgba(37, 21, 32, 0.9);

    --text: #f5e8ef;
    --text-primary: #f5e8ef;
    --text-secondary: #d4a8bf;
    --text-muted: #9a6a82;
    --text-nav: #d4a8bf;

    --accent: #f472b6;
    --accent-soft: #3a1228;

    --success: #fb923c;
    --success-soft: #2e1508;

    --border: #3d1f30;
    --divider: #321828;

    --bg-nav: #251520;
    --nav-active-bg: rgba(244, 114, 182, 0.2);
    --nav-active-fg: #f5e8ef;
    --shadow-nav: 0 10px 30px rgba(0, 0, 0, 0.4);

    --shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    --blur-effect: none;
  }

  /* ─── MIDNIGHT ───────────────────────────────────────────── */
  :global(body.midnight) {
    --bg: #070b14;
    --surface: #0d1526;
    --surface-alt: #111d35;
    --bg-bar: rgba(13, 21, 38, 0.9);

    --text: #e8eeff;
    --text-primary: #e8eeff;
    --text-secondary: #8fa8d4;
    --text-muted: #4a6090;
    --text-nav: #8fa8d4;

    --accent: #6366f1;
    --accent-soft: #0f1435;

    --success: #22d3ee;
    --success-soft: #062030;

    --border: #1a2a4a;
    --divider: #111f3a;

    --bg-nav: #0d1526;
    --nav-active-bg: rgba(99, 102, 241, 0.2);
    --nav-active-fg: #e8eeff;
    --shadow-nav: 0 10px 30px rgba(0, 0, 0, 0.5);

    --shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    --blur-effect: none;
  }

  /* ─── AMBER ──────────────────────────────────────────────── */
  :global(body.amber) {
    --bg: #14100a;
    --surface: #1e1710;
    --surface-alt: #281f15;
    --bg-bar: rgba(30, 23, 16, 0.9);

    --text: #f5ede0;
    --text-primary: #f5ede0;
    --text-secondary: #c8a87a;
    --text-muted: #8a6a40;
    --text-nav: #c8a87a;

    --accent: #f59e0b;
    --accent-soft: #2a1f08;

    --success: #84cc16;
    --success-soft: #1a2208;

    --border: #362a18;
    --divider: #2a2010;

    --bg-nav: #1e1710;
    --nav-active-bg: rgba(245, 158, 11, 0.2);
    --nav-active-fg: #f5ede0;
    --shadow-nav: 0 10px 30px rgba(0, 0, 0, 0.45);

    --shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    --blur-effect: none;
  }

  :global(body) {
    background-color: var(--bg);
    margin: 0;
    padding: 0;
    color: var(--text-primary);
    font-family: -apple-system, sans-serif;
    -webkit-user-select: none;
    user-select: none;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-overflow-scrolling: touch;
  }

  main {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    width: 100vw;
    overflow: hidden;
  }

  .top-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    height: 50px;
    padding-top: env(safe-area-inset-top);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-bar);
    flex-shrink: 0;
    /* border-bottom: 0.5px solid rgba(255, 255, 255, 0.1); */
  }

  .top-bar h1 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    position: relative;
    padding-top: calc(50px + env(safe-area-inset-top));
    padding-bottom: calc(50px + env(safe-area-inset-bottom));
  }

  .nav-wrapper {
    padding-bottom: env(safe-area-inset-bottom);
    display: flex;
    justify-content: center;
    background: transparent;
    flex-shrink: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    z-index: 2;
  }

  .bottom-nav {
    pointer-events: all;
    display: flex;
    background-color: var(--bg-nav);
    padding: 8px;
    border-radius: 28px;
    gap: 15px;
    /* border: 1px solid var(--border); */
    box-shadow: var(--shadow-nav);
    margin-bottom: 10px;
  }

  .nav-item {
    background: transparent;
    border: none;
    width: 55px;
    height: 55px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-nav);
    transition: all 0.2s ease;
  }

  .nav-item.active {
    color: var(--nav-active-fg);
    background-color: var(--nav-active-bg);
  }

  .nav-item:active {
    transform: scale(0.9);
  }

  .icon svg {
    display: block;
  }

  .app-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: var(--bg);
    color: var(--text-primary);
    gap: 16px;
    font-family: system-ui, sans-serif;
  }
  .app-spinner {
    width: 42px;
    height: 42px;
    border: 3.5px solid var(--surface-alt);
    border-top: 3.5px solid var(--accent);
    border-radius: 50%;
    animation: app-spin 1s linear infinite;
  }
  @keyframes app-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
