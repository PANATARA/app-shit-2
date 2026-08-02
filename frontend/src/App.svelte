<script lang="ts">
    import { onMount } from "svelte";
    import BoardScreen from "$screens/app/BoardScreen.svelte";
    import StatsScreen from "$screens/app/StatsScreen.svelte";
    import ProfileSettingsScreen from "$screens/app/ProfileSettingsScreen.svelte";
    import DebugScreen from "$screens/debug/DebugScreen.svelte";

    import AuthScreen from "$screens/onBoarding/AuthScreen.svelte";
    import FamilyEntryScreen from "$screens/onBoarding/FamilyEntryScreen.svelte";

    import Icon from "@iconify/svelte";
    import { isLoggedInStore, clearTokens } from "$api/client.js";
    import { getProfile } from "$api/me.js";

    import UserProfileModal from "$features/common/UserProfileModal.svelte";
    import { profileModal, closeProfile } from "$lib/settings";

    let isAuthed = false;
    let isInFamily = false;
    let checkingAuth = true;

    const screenTitle: Record<string, string> = {
        statsScreen: "Обзор",
        boardScreen: "Домашние дела",
        settingsScreen: "Настройки",
        debugScreen: "Debug",
    };

    let activeTab = "statsScreen";

    onMount(async () => {
        if ($isLoggedInStore) {
            await checkProfile();
        }
        checkingAuth = false;
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
        <!-- <header class="top-bar">
      <h1>{screenTitle[activeTab]}</h1>
    </header> -->

        <div class="content">
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
                    class:active={activeTab === "statsScreen"}
                    on:click={() => (activeTab = "statsScreen")}
                    aria-label="Главная"
                >
                    <div class="nav-icon">
                        <Icon
                            icon="material-symbols:home-rounded"
                            width="24"
                            height="24"
                        />
                    </div>
                    <span class="nav-label">Главная</span>
                </button>

                <button
                    class="nav-item"
                    class:active={activeTab === "boardScreen"}
                    on:click={() => (activeTab = "boardScreen")}
                    aria-label="Доска"
                >
                    <div class="nav-icon">
                        <Icon
                            icon="material-symbols:calendar-month"
                            width="24"
                            height="24"
                        />
                    </div>
                    <span class="nav-label">Доска</span>
                </button>

                <button
                    class="nav-item"
                    class:active={activeTab === "debugScreen"}
                    on:click={() => (activeTab = "debugScreen")}
                    aria-label="Карта"
                >
                    <div class="nav-icon">
                        <Icon
                            icon="material-symbols:location-on"
                            width="24"
                            height="24"
                        />
                    </div>
                    <span class="nav-label">Карта</span>
                </button>

                <button
                    class="nav-item"
                    class:active={activeTab === "settingsScreen"}
                    on:click={() => (activeTab = "settingsScreen")}
                    aria-label="Настройки"
                >
                    <div class="nav-icon">
                        <Icon
                            icon="material-symbols:settings-rounded"
                            width="24"
                            height="24"
                        />
                    </div>
                    <span class="nav-label">Профиль</span>
                </button>
            </nav>
        </div>
    {/if}
    {#if $profileModal}
        <UserProfileModal userId={$profileModal} on:close={closeProfile} />
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
        --bg: #fdf6ee;
        --surface: #fffcf8;
        --surface-alt: #fdeee4;
        --bg-bar: rgba(255, 252, 248, 0.92);
        --text: #2c1a0e;
        --text-primary: #2c1a0e;
        --text-secondary: #7a4030;
        --text-muted: #b07060;
        --text-nav: #7a4030;
        --accent: #e05c3a;
        --accent-soft: #fdeee4;
        --success: #5a9e6f;
        --success-soft: #dff2e8;
        --border: #f0d8cc;
        --divider: #fdeee4;
        --bg-nav: #fffcf8;
        --nav-active-bg: rgba(224, 92, 58, 0.12);
        --nav-active-fg: #2c1a0e;
        --shadow-nav: 0 10px 30px rgba(44, 26, 14, 0.08);
        --shadow: 0 8px 24px rgba(44, 26, 14, 0.08);
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

    :global(body.rose) {
        --bg: #cce8f4;
        --surface: #ddf0fb;
        --surface-alt: #f2d5e4;
        --bg-bar: rgba(221, 240, 251, 0.9);
        --text: #1a0a12;
        --text-primary: #1a0a12;
        --text-secondary: #7b1040;
        --text-muted: #a04868;
        --text-nav: #7b1040;
        --accent: #c2185b;
        --accent-soft: #f2d5e4;
        --success: #0277bd;
        --success-soft: #9dd8f0;
        --border: #f0aac8;
        --divider: #f2d5e4;
        --bg-nav: #ddf0fb;
        --nav-active-bg: rgba(194, 24, 91, 0.14);
        --nav-active-fg: #1a0a12;
        --shadow-nav: 0 10px 30px rgba(0, 0, 0, 0.13);
        --shadow: 0 8px 24px rgba(0, 0, 0, 0.13);
        --blur-effect: none;
    }

    :global(body.royal) {
        --bg: #dff7ff;
        --surface: #edfaff;
        --surface-alt: #d6e8ff;
        --bg-bar: rgba(237, 250, 255, 0.9);
        --text: #071a4a;
        --text-primary: #071a4a;
        --text-secondary: #1a3dbf;
        --text-muted: #5070cc;
        --text-nav: #1a3dbf;
        --accent: #2457ff;
        --accent-soft: #d6e8ff;
        --success: #0891b2;
        --success-soft: #cff4fc;
        --border: #b8d4f8;
        --divider: #d6e8ff;
        --bg-nav: #edfaff;
        --nav-active-bg: rgba(36, 87, 255, 0.12);
        --nav-active-fg: #071a4a;
        --shadow-nav: 0 10px 30px rgba(0, 0, 0, 0.1);
        --shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
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
        padding-top: calc(env(safe-area-inset-top));
        padding-bottom: calc(85px + env(safe-area-inset-bottom));
    }

    .nav-wrapper {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        pointer-events: none;
        z-index: 100;
    }

    .bottom-nav {
        width: 100%;
        pointer-events: all;
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        padding: 10px 8px calc(16px + env(safe-area-inset-bottom));
        background: color-mix(in srgb, var(--bg-nav) 92%, transparent);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 28px 28px 0 0;
        box-shadow:
            0 -1px 0 rgba(255, 255, 255, 0.05),
            0 -8px 32px rgba(0, 0, 0, 0.12);
    }

    /* ── ITEM ────────────────────────────────────── */
    .nav-item {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 4px;
        border: none;
        border-radius: 18px;
        background: transparent;
        color: var(--text-nav);
        font-family: inherit;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .nav-item:active {
        transform: scale(0.88);
    }

    /* ── ICON WRAP ───────────────────────────────── */
    .nav-icon {
        width: 44px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: transparent;
        transition:
            background 0.2s ease,
            transform 0.2s ease;
    }

    .nav-item :global(svg) {
        transition: transform 0.2s ease;
    }

    /* ── LABEL ───────────────────────────────────── */
    .nav-label {
        font-size: 10px;
        font-weight: 600;
        color: var(--text-nav);
        letter-spacing: 0.2px;
        transition: color 0.2s ease;
        line-height: 1;
    }

    /* ── ACTIVE ──────────────────────────────────── */
    .nav-item.active {
        color: var(--accent);
    }

    .nav-item.active .nav-icon {
        background: color-mix(in srgb, var(--accent) 14%, transparent);
        transform: translateY(-2px);
    }

    .nav-item.active .nav-icon :global(svg) {
        transform: scale(1.1);
    }

    .nav-item.active .nav-label {
        color: var(--accent);
        font-weight: 700;
    }

    @media (hover: hover) {
        .nav-item:hover .nav-icon {
            background: rgba(255, 255, 255, 0.06);
        }
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
