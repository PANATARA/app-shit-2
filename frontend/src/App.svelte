<script lang="ts">
    import { onMount } from "svelte";
    import BoardScreen from "$screens/app/BoardScreen.svelte";
    import StatsScreen from "$screens/app/StatsScreen.svelte";
    import ProfileSettingsScreen from "$screens/app/ProfileSettingsScreen.svelte";
    import MealsHubScreen from "$screens/meals/MealsHubScreen.svelte";

    import AuthScreen from "$screens/onBoarding/AuthScreen.svelte";

    import Icon from "@iconify/svelte";
    import { isLoggedInStore, clearTokens } from "$api/client.js";
    import { getProfile } from "$api/me.js";
    import { getCached, setCached } from "$lib/cache";

    import UserProfileModal from "$screens/modal/UserProfileModal.svelte";
    import { profileModal, closeProfile } from "$lib/settings";
    import { activeTab, closeTopModal, navigateBack, notifyNativeNavigation } from "$lib/navigation";
    import { t } from "$lib/i18n";
    import StepOne from "$screens/tabs/PlannedChoreCreate/StepOne.svelte";
    import StepTwo from "$screens/tabs/PlannedChoreCreate/StepTwo.svelte";
    import PlannedChoreDetail from "$screens/tabs/PlannedChoreDetail.svelte";
    import ChoreListScreen from "$screens/tabs/FamilyChores/ChoreListScreen.svelte";
    import ChoreEditScreen from "$screens/tabs/FamilyChores/ChoreEditScreen.svelte";
    import ChoreTemplatesScreen from "$screens/tabs/FamilyChores/ChoreTemplatesScreen.svelte";

    import OnboardingWelcomeScreen from "$screens/onBoarding/OnboardingWelcomeScreen.svelte";
    import OnboardingProfileScreen from "$screens/onBoarding/OnboardingProfileScreen.svelte";
    import OnboardingChooseScreen from "$screens/onBoarding/OnboardingChooseScreen.svelte";
    import OnboardingCreateStep1Screen from "$screens/onBoarding/OnboardingCreateStep1Screen.svelte";
    import OnboardingCreateStep2Screen from "$screens/onBoarding/OnboardingCreateStep2Screen.svelte";
    import OnboardingJoinScreen from "$screens/onBoarding/OnboardingJoinScreen.svelte";
    import EventCreateScreen from "$screens/tabs/EventCreate.svelte";
    import EventsListScreen from "$screens/tabs/EventsListScreen.svelte";
    import ChoreCreateScreen from "$screens/tabs/FamilyChores/ChoreCreateScreen.svelte";

    let isAuthed = false;
    let isInFamily = false;
    let checkingAuth = true;

    onMount(() => {
        const unsubActiveTab = activeTab.subscribe(() => {
            notifyNativeNavigation();
        });

        (window as any).onNativeBack = (action: string = "") => {
            if (action === "closeModal") {
                closeTopModal();
            } else {
                navigateBack();
            }
        };

        (async () => {
            if ($isLoggedInStore) {
                const cachedProfile = getCached<any>("profile");
                if (cachedProfile) {
                    isAuthed = true;
                    isInFamily = !!cachedProfile.is_family_member;
                    checkingAuth = false;
                }
                await checkProfile();
            } else {
                checkingAuth = false;
                return;
            }
            checkingAuth = false;
        })();

        notifyNativeNavigation();

        return () => {
            unsubActiveTab();
            delete (window as any).onNativeBack;
        };
    });

    async function checkProfile() {
        try {
            const profile = await getProfile();
            setCached("profile", profile);
            isAuthed = true;
            isInFamily = !!profile.is_family_member;
            if (!isInFamily) {
                if (!profile.name) {
                    activeTab.set("onboardingProfile");
                } else {
                    activeTab.set("onboardingChoose");
                }
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
        {#if $activeTab === "onboardingProfile"}
            <OnboardingProfileScreen />
        {:else if $activeTab === "onboardingWelcome"}
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
            <OnboardingProfileScreen />
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
                <MealsHubScreen />
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
            {:else if $activeTab === "eventsListScreen"}
                <EventsListScreen />
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
                    aria-label={$t.nav.meals || "Меню"}
                >
                    <div class="nav-icon">
                        <Icon
                            icon="material-symbols:restaurant-rounded"
                            width="24"
                            height="24"
                        />
                    </div>
                    <span class="nav-label">{$t.nav.meals || "Меню"}</span>
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
    /* ─── Global Base & Member Tokens ───────────────────────── */
    :global(:root) {
        --member-1: #E06A47;
        --member-2: #4E9F6A;
        --member-3: #3D82C4;
        --member-4: #9A69B5;
        --member-5: #D68A36;
        --member-6: #E25275;

        --radius-sm: 12px;
        --radius-card: 22px;
        --radius-modal: 28px;
        --radius-pill: 999px;
    }

    /* ─── 1. Warm / Sunset («Тёплый семейный уют» - Default) ─ */
    :global(body),
    :global(body.warm),
    :global(body.sunset),
    :global([data-theme="warm"]),
    :global([data-theme="sunset"]) {
        --bg: #FAF7F2;
        --surface: #FFFFFF;
        --surface-alt: #F4EFEA;
        --bg-bar: rgba(255, 255, 255, 0.92);
        --text: #231F20;
        --text-primary: #231F20;
        --text-secondary: #5D5350;
        --text-muted: #938884;
        --text-nav: #6A605C;
        --accent: #E06A47;
        --accent-soft: rgba(224, 106, 71, 0.12);
        --accent-gradient: linear-gradient(135deg, #E06A47 0%, #EA8062 100%);
        --accent-glow: rgba(224, 106, 71, 0.32);
        --accent-fg: #FFFFFF;
        --success: #4E9F6A;
        --success-soft: rgba(78, 159, 106, 0.14);
        --border: rgba(147, 136, 132, 0.22);
        --border-subtle: rgba(147, 136, 132, 0.14);
        --divider: rgba(147, 136, 132, 0.1);
        --bg-nav: #FFFFFF;
        --nav-active-bg: rgba(224, 106, 71, 0.12);
        --nav-active-fg: #E06A47;
        --shadow-card: 0 6px 20px -3px rgba(60, 40, 30, 0.06), 0 2px 6px -1px rgba(60, 40, 30, 0.04);
        --shadow-ambient: 0 4px 18px rgba(60, 40, 30, 0.05);
        --shadow-floating: 0 10px 28px -4px rgba(224, 106, 71, 0.36), 0 4px 12px rgba(60, 40, 30, 0.08);
        --shadow-nav: 0 -4px 20px rgba(60, 40, 30, 0.06);
        --blur-effect: none;
    }

    /* ─── 2. Soft / Rose («Нежность и забота») ──────────────── */
    :global(body.soft),
    :global(body.rose),
    :global([data-theme="soft"]),
    :global([data-theme="rose"]) {
        --bg: #FDF7F8;
        --surface: #FFFFFF;
        --surface-alt: #F9ECF0;
        --bg-bar: rgba(255, 255, 255, 0.92);
        --text: #24181F;
        --text-primary: #24181F;
        --text-secondary: #684B5B;
        --text-muted: #9E8090;
        --text-nav: #735666;
        --accent: #E25275;
        --accent-soft: rgba(226, 82, 117, 0.12);
        --accent-gradient: linear-gradient(135deg, #E25275 0%, #F06E8E 100%);
        --accent-glow: rgba(226, 82, 117, 0.32);
        --accent-fg: #FFFFFF;
        --success: #52A684;
        --success-soft: rgba(82, 166, 132, 0.14);
        --border: rgba(158, 128, 144, 0.22);
        --border-subtle: rgba(158, 128, 144, 0.14);
        --divider: rgba(158, 128, 144, 0.1);
        --bg-nav: #FFFFFF;
        --nav-active-bg: rgba(226, 82, 117, 0.12);
        --nav-active-fg: #E25275;
        --shadow-card: 0 6px 20px -3px rgba(80, 40, 60, 0.06), 0 2px 6px -1px rgba(80, 40, 60, 0.04);
        --shadow-ambient: 0 4px 18px rgba(80, 40, 60, 0.05);
        --shadow-floating: 0 10px 28px -4px rgba(226, 82, 117, 0.36), 0 4px 12px rgba(80, 40, 60, 0.08);
        --shadow-nav: 0 -4px 20px rgba(80, 40, 60, 0.06);
        --blur-effect: none;
    }

    /* ─── 3. Night («Уютный вечер дома») ───────────────────── */
    :global(body.night),
    :global([data-theme="night"]) {
        --bg: #17151B;
        --surface: #221E27;
        --surface-alt: #2D2734;
        --bg-bar: rgba(34, 30, 39, 0.94);
        --text: #F5EFEB;
        --text-primary: #F5EFEB;
        --text-secondary: #B8ADB7;
        --text-muted: #827785;
        --text-nav: #B8ADB7;
        --accent: #FF9A6C;
        --accent-soft: rgba(255, 154, 108, 0.15);
        --accent-gradient: linear-gradient(135deg, #FF9A6C 0%, #FFB28E 100%);
        --accent-glow: rgba(255, 154, 108, 0.35);
        --accent-fg: #17151B;
        --success: #61BD82;
        --success-soft: rgba(97, 189, 130, 0.16);
        --border: rgba(255, 255, 255, 0.12);
        --border-subtle: rgba(255, 255, 255, 0.08);
        --divider: rgba(255, 255, 255, 0.07);
        --bg-nav: #221E27;
        --nav-active-bg: rgba(255, 154, 108, 0.16);
        --nav-active-fg: #FF9A6C;
        --shadow-card: 0 8px 24px -4px rgba(0, 0, 0, 0.48), 0 2px 8px -1px rgba(0, 0, 0, 0.35);
        --shadow-ambient: 0 4px 18px rgba(0, 0, 0, 0.35);
        --shadow-floating: 0 10px 28px -4px rgba(255, 154, 108, 0.35), 0 4px 12px rgba(0, 0, 0, 0.45);
        --shadow-nav: 0 -4px 22px rgba(0, 0, 0, 0.45);
        --blur-effect: none;
    }

    /* ─── 4. Royal («Свежесть и гармония») ─────────────────── */
    :global(body.royal),
    :global([data-theme="royal"]) {
        --bg: #F2F8FC;
        --surface: #FFFFFF;
        --surface-alt: #E6F1FA;
        --bg-bar: rgba(255, 255, 255, 0.92);
        --text: #0D1C34;
        --text-primary: #0D1C34;
        --text-secondary: #3D5477;
        --text-muted: #788EA8;
        --text-nav: #4B6387;
        --accent: #2D72D9;
        --accent-soft: rgba(45, 114, 217, 0.12);
        --accent-gradient: linear-gradient(135deg, #2D72D9 0%, #4B8CF2 100%);
        --accent-glow: rgba(45, 114, 217, 0.32);
        --accent-fg: #FFFFFF;
        --success: #0891B2;
        --success-soft: rgba(8, 145, 178, 0.14);
        --border: rgba(120, 142, 168, 0.22);
        --border-subtle: rgba(120, 142, 168, 0.14);
        --divider: rgba(120, 142, 168, 0.1);
        --bg-nav: #FFFFFF;
        --nav-active-bg: rgba(45, 114, 217, 0.12);
        --nav-active-fg: #2D72D9;
        --shadow-card: 0 6px 20px -3px rgba(20, 45, 80, 0.06), 0 2px 6px -1px rgba(20, 45, 80, 0.04);
        --shadow-ambient: 0 4px 18px rgba(20, 45, 80, 0.05);
        --shadow-floating: 0 10px 28px -4px rgba(45, 114, 217, 0.35), 0 4px 12px rgba(20, 45, 80, 0.08);
        --shadow-nav: 0 -4px 20px rgba(20, 45, 80, 0.06);
        --blur-effect: none;
    }

    :global(body) {
        background-color: var(--bg);
        margin: 0;
        padding: 0;
        color: var(--text-primary);
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
        -webkit-user-select: none;
        user-select: none;
        overflow: hidden;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-overflow-scrolling: touch;
        transition: background-color 0.25s ease, color 0.25s ease;
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
        padding-bottom: calc(88px + env(safe-area-inset-bottom));
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
        align-items: center;
        justify-content: space-around;
        padding: 10px 12px calc(14px + env(safe-area-inset-bottom));
        background: var(--bg-nav);
        border-top: 1px solid var(--border-subtle);
        border-radius: 26px 26px 0 0;
        box-shadow: var(--shadow-nav);
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
        transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
    }

    .nav-item:active {
        transform: scale(0.92);
    }

    /* ── ICON WRAP ───────────────────────────────── */
    .nav-icon {
        width: 44px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        background: transparent;
        transition:
            background 0.2s ease,
            transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .nav-item :global(svg) {
        transition: transform 0.2s ease;
    }

    /* ── LABEL ───────────────────────────────────── */
    .nav-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-nav);
        letter-spacing: 0.15px;
        transition:
            color 0.2s ease,
            transform 0.2s ease,
            font-weight 0.2s ease;
        line-height: 1.1;
    }

    /* ── ACTIVE ──────────────────────────────────── */
    .nav-item.active {
        color: var(--nav-active-fg);
    }

    .nav-item.active .nav-icon {
        background: var(--nav-active-bg);
        transform: translateY(-2px);
    }

    .nav-item.active .nav-icon :global(svg) {
        transform: scale(1.08);
    }

    .nav-item.active .nav-label {
        color: var(--nav-active-fg);
        font-weight: 700;
        transform: scale(1.04);
    }

    @media (hover: hover) {
        .nav-item:hover .nav-icon {
            background: var(--accent-soft);
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
