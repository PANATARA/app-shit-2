<script lang="ts">
    import { onMount } from "svelte";
    import BoardScreen from "$screens/app/BoardScreen.svelte";
    import StatsScreen from "$screens/app/StatsScreen.svelte";
    import ProfileSettingsScreen from "$screens/app/ProfileSettingsScreen.svelte";
    import DebugScreen from "$screens/debug/DebugScreen.svelte";

    import AuthScreen from "$screens/onBoarding/AuthScreen.svelte";

    import Icon from "@iconify/svelte";
    import { isLoggedInStore, clearTokens } from "$api/client.js";
    import { getProfile } from "$api/me.js";

    import UserProfileModal from "$screens/modal/UserProfileModal.svelte";
    import { profileModal, closeProfile } from "$lib/settings";
    import { activeTab } from "$lib/navigation";
    import { t } from "$lib/i18n";
    import StepOne from "$screens/tabs/PlannedChoreCreate/StepOne.svelte";
    import StepTwo from "$screens/tabs/PlannedChoreCreate/StepTwo.svelte";
    import PlannedChoreDetail from "$screens/tabs/PlannedChoreDetail.svelte";
    import ChoreListScreen from "$screens/tabs/FamilyChores/ChoreListScreen.svelte";
    import ChoreEditScreen from "$screens/tabs/FamilyChores/ChoreEditScreen.svelte";
    import ChoreTemplatesScreen from "$screens/tabs/FamilyChores/ChoreTemplatesScreen.svelte";

    import OnboardingWelcomeScreen from "$screens/onBoarding/OnboardingWelcomeScreen.svelte";
    import OnboardingChooseScreen from "$screens/onBoarding/OnboardingChooseScreen.svelte";
    import OnboardingCreateStep1Screen from "$screens/onBoarding/OnboardingCreateStep1Screen.svelte";
    import OnboardingCreateStep2Screen from "$screens/onBoarding/OnboardingCreateStep2Screen.svelte";
    import OnboardingJoinScreen from "$screens/onBoarding/OnboardingJoinScreen.svelte";
    import EventCreateScreen from "$screens/tabs/EventCreate.svelte";
    import ChoreCreateScreen from "$screens/tabs/FamilyChores/ChoreCreateScreen.svelte";

    let isAuthed = false;
    let isInFamily = false;
    let checkingAuth = true;

    onMount(async () => {
        if ($isLoggedInStore) {
            await checkProfile();
        } else {
            checkingAuth = false;
            return;
        }
        checkingAuth = false;
    });

    async function checkProfile() {
        try {
            const profile = await getProfile();
            isAuthed = true;
            isInFamily = !!profile.is_family_member;
            if (!isInFamily) {
                activeTab.set("onboardingWelcome"); // ← стартуем онбординг
            }
        } catch (err) {
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

    let contentEl: HTMLElement;

    $: if ($activeTab && contentEl) {
        contentEl.scrollTop = 0;
    }
</script>

<main>
    {#if checkingAuth}
        <div class="app-loading">
            <div class="app-spinner"></div>
            <p style="margin: 0; font-size: 15px; font-weight: 500;">
                {$t.nav.checkingAuth}
            </p>
        </div>
    {:else if !isAuthed}
        <AuthScreen on:auth={handleAuth} />
    {:else if !isInFamily}
        {#if $activeTab === "onboardingWelcome"}
            <OnboardingWelcomeScreen />
        {:else if $activeTab === "onboardingChoose"}
            <OnboardingChooseScreen />
        {:else if $activeTab === "onboardingCreateStep1"}
            <OnboardingCreateStep1Screen />
        {:else if $activeTab === "onboardingCreateStep2"}
            <OnboardingCreateStep2Screen onSuccess={handleFamilySuccess} />
        {:else if $activeTab === "onboardingJoin"}
            <OnboardingJoinScreen onSuccess={handleFamilySuccess} />
        {:else}
            <OnboardingWelcomeScreen />
        {/if}
    {:else}
        <div class="content" bind:this={contentEl}>
            {#if $activeTab === "statsScreen"}
                <StatsScreen />
            {:else if $activeTab === "boardScreen"}
                <BoardScreen />
            {:else if $activeTab === "settingsScreen"}
                <ProfileSettingsScreen
                    on:logout={() => {
                        isAuthed = false;
                        isInFamily = false;
                    }}
                    on:family-left={() => {
                        isInFamily = false;
                        activeTab.set("onboardingWelcome");
                    }}
                />
            {:else if $activeTab === "debugScreen"}
                <DebugScreen />
            {:else if $activeTab === "createPlannedChoreStepOne"}
                <StepOne />
            {:else if $activeTab === "createPlannedChoreStepTwo"}
                <StepTwo />
            {:else if $activeTab === "DetailPlannedChore"}
                <PlannedChoreDetail />
            {:else if $activeTab === "choreListScreen"}
                <ChoreListScreen />
            {:else if $activeTab === "choreEditScreen"}
                <ChoreEditScreen />
            {:else if $activeTab === "choreCreateScreen"}
                <ChoreCreateScreen />
            {:else if $activeTab === "choreTemplatesScreen"}
                <ChoreTemplatesScreen />
            {:else if $activeTab === "eventCreate"}
                <EventCreateScreen />
            {/if}
        </div>

        <div class="nav-wrapper">
            <nav class="bottom-nav">
                <button
                    class="nav-item"
                    class:active={$activeTab === "statsScreen"}
                    on:click={() => activeTab.set("statsScreen")}
                    aria-label={$t.nav.home}
                >
                    <div class="nav-icon">
                        <Icon
                            icon="material-symbols:home-rounded"
                            width="24"
                            height="24"
                        />
                    </div>
                    <span class="nav-label">{$t.nav.home}</span>
                </button>

                <button
                    class="nav-item"
                    class:active={$activeTab === "boardScreen"}
                    on:click={() => activeTab.set("boardScreen")}
                    aria-label={$t.nav.board}
                >
                    <div class="nav-icon">
                        <Icon
                            icon="material-symbols:calendar-month"
                            width="24"
                            height="24"
                        />
                    </div>
                    <span class="nav-label">{$t.nav.board}</span>
                </button>

                <button
                    class="nav-item"
                    class:active={$activeTab === "debugScreen"}
                    on:click={() => activeTab.set("debugScreen")}
                    aria-label={$t.nav.map}
                >
                    <div class="nav-icon">
                        <Icon
                            icon="material-symbols:location-on"
                            width="24"
                            height="24"
                        />
                    </div>
                    <span class="nav-label">{$t.nav.map}</span>
                </button>

                <button
                    class="nav-item"
                    class:active={$activeTab === "settingsScreen"}
                    on:click={() => activeTab.set("settingsScreen")}
                    aria-label={$t.nav.profile}
                >
                    <div class="nav-icon">
                        <Icon
                            icon="material-symbols:settings-rounded"
                            width="24"
                            height="24"
                        />
                    </div>
                    <span class="nav-label">{$t.nav.profile}</span>
                </button>
            </nav>
        </div>
    {/if}
    {#if $profileModal}
        <UserProfileModal userId={$profileModal} on:close={closeProfile} />
    {/if}
</main>

<style>
    /* ─── sunset ───────────────────────────────────────────── */
    :global(body.sunset) {
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
        transition:
            color 0.2s ease,
            transform 0.2s ease,
            font-weight 0.2s ease;
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
        transform: scale(1.05);
        transition:
            transform 0.2s ease,
            color 0.2s ease;
    }

    @media (hover: hover) {
        .nav-item:hover .nav-icon {
            background: rgba(255, 255, 255, 0.06);
        }
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
