<script>
  import { onMount } from "svelte";
  import AuthScreen from "./AuthScreen.svelte";

  import AddHabit from "./AddHabit.svelte";
  import Settings from "./Settings.svelte";
  import Habits from "./Habits.svelte";
  import Debug from "./FamilyCreateJoin.svelte";
  import { icons } from "./lib/icons";
  import { t } from "./lib/i18n.js";

  import { isLoggedInStore, clearTokens } from "./api/client.js";
  import { getProfile } from "./api/me.js";

  let isAuthed = false;
  let isInFamily = true;
  let checkingAuth = true;

  let activeTab = "habits";
  let selectedHabit = null;

  onMount(async () => {
    if ($isLoggedInStore) {
      try {
        const profile = await getProfile();
        isInFamily = !!profile.is_family_member;
      } catch (err) {
        console.warn("Auth token validation failed, logging out:", err);
        clearTokens();
      }
    }
    checkingAuth = false;
  });

  $: isAuthed = $isLoggedInStore;

  onMount(() => {
    // Регистрируем глобальный хук для нативного back
    window.onAndroidBack = () => {
      if (selectedHabit) {
        closeDetail();
      } else if (activeTab !== "habits") {
        activeTab = "habits";
      } else {
        AndroidBridge?.finish?.();
      }
    };
    return () => {
      window.onAndroidBack = null;
    };
  });

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
    <AuthScreen on:auth={() => (isAuthed = true)} />
  {:else if !isInFamily}
    <Debug />
  {:else}
    {#if !selectedHabit}
      <header class="top-bar">
        <h1>{$t.app[activeTab] ?? ""}</h1>
      </header>
    {/if}

    <div class="content" class:no-topbar={!!selectedHabit}>
      {#if activeTab === "habits"}
        <Habits />
      {:else if activeTab === "add"}
        <AddHabit />
      {:else if activeTab === "settings"}
        <Settings />
      {/if}
    </div>

    <div class="nav-wrapper">
      <nav class="bottom-nav">
        <button
          class="nav-item"
          on:click={() => (activeTab = "habits")}
          class:active={activeTab === "habits"}
          aria-label="Habits"
        >
          <span class="icon">
            <svg width="25" height="25" fill="currentColor">
              <path d={icons.home} />
            </svg>
          </span>
        </button>

        <button
          class="nav-item plus-btn"
          on:click={() => (activeTab = "add")}
          class:active={activeTab === "add"}
          aria-label="New habit"
        >
          <span class="icon">
            <svg width="25" height="25" fill="currentColor">
              <path d={icons.language} />
            </svg>
          </span>
        </button>

        <button
          class="nav-item"
          on:click={() => (activeTab = "settings")}
          class:active={activeTab === "settings"}
          aria-label="Settings"
        >
          <span class="icon">
            <svg width="25" height="25" fill="currentColor">
              <path d={icons.settings} />
            </svg>
          </span>
        </button>

        <button
          class="nav-item"
          on:click={() => (activeTab = "debug")}
          class:active={activeTab === "debug"}
          aria-label="Settings"
        >
          <span class="icon">
            <svg width="25" height="25" fill="currentColor">
              <path d={icons.settings} />
            </svg>
          </span>
        </button>
      </nav>
    </div>
  {/if}
</main>

<style>
  /* ── CSS переменные: тёмная тема (default) ── */
  /* ── Тёмная тема ───────────────────────────── */

  :global(:root) {
    /* Backgrounds */
    --bg: #2b2622;
    --surface: #35302b;
    --surface-alt: #413a34;
    --bg-bar: rgba(53, 48, 43, 0.9);

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
    --nav-bg: rgba(53, 48, 43, 0.9);
    --nav-active-bg: rgba(213, 138, 114, 0.18);
    --nav-active-fg: #f2ebe3;
    --shadow-nav: 0 10px 30px rgba(0, 0, 0, 0.25);

    /* Effects */
    --shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    --blur-effect: none;
  }

  :global(body.blur) {
    --nav-bg: rgba(53, 48, 43, 0.72);
    --bg-bar: rgba(53, 48, 43, 0.72);
    --blur-effect: blur(10px);
  }

  /* ── Светлая тема ───────────────────────────── */

  :global(body.light) {
    /* Backgrounds */
    --bg: #f4ede4;
    --surface: #fbf7f2;
    --surface-alt: #efe3d4;
    --bg-bar: rgba(251, 247, 242, 0.9);

    /* Text */
    --text: #4d433a;
    --text-primary: #4d433a;
    --text-secondary: #8a8076;
    --text-muted: #b0a59a;
    --text-nav: #8a8076;

    /* Brand */
    --accent: #c97b63;
    --accent-soft: #f1ddd6;

    /* Success */
    --success: #8faf9a;
    --success-soft: #e3ece6;

    /* UI */
    --border: #e3d6c7;
    --divider: #e8dccd;

    /* Navigation */
    --nav-bg: rgba(251, 247, 242, 0.9);
    --nav-active-bg: rgba(201, 123, 99, 0.15);
    --nav-active-fg: #4d433a;
    --shadow-nav: 0 10px 30px rgba(77, 67, 58, 0.08);

    /* Effects */
    --shadow: 0 8px 24px rgba(77, 67, 58, 0.08);
    --blur-effect: none;
  }

  :global(body.light.blur) {
    --nav-bg: rgba(251, 247, 242, 0.72);
    --bg-bar: rgba(251, 247, 242, 0.72);
    --blur-effect: blur(10px);
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

  :global(body.blur) .top-bar,
  :global(body.blur) .bottom-nav {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
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
