<script lang="ts">
    import { onMount } from "svelte";
    import { cubicOut, quadIn } from "svelte/easing";
    import { slide } from "svelte/transition";
    import BoardScreen from "$screens/app/BoardScreen.svelte";
    import StatsScreen from "$screens/app/StatsScreen.svelte";
    import ProfileSettingsScreen from "$screens/app/ProfileSettingsScreen.svelte";
    import MealsHubScreen from "$screens/meals/MealsHubScreen.svelte";

    import AuthScreen from "$screens/onBoarding/AuthScreen.svelte";

    import Icon from "@iconify/svelte";
    import { isLoggedInStore, clearTokens } from "$api/client.js";
    import { getProfile } from "$api/me.js";
    import { getCached, setCached, removeCached } from "$lib/cache";
    import { isOfflineStore, setOffline } from "$lib/network";
    import { mutate } from "$lib/swr";
    import { initPushNotifications, registerPushToken } from "$lib/pushNotifications";

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

        const handleOnline = () => {
            setOffline(false);
            if ($isLoggedInStore) {
                checkProfile();
            }
        };

        const handleOffline = () => {
            setOffline(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

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
        initPushNotifications();

        return () => {
            unsubActiveTab();
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            delete (window as any).onNativeBack;
        };
    });

    async function checkProfile() {
        try {
            const profile = await getProfile();
            setCached("profile", profile);
            isAuthed = true;
            isInFamily = !!profile.is_family_member;
            setOffline(false);

            // Sync push token for authenticated user
            registerPushToken().catch((e) => {
                console.warn("Failed to sync push token:", e);
            });

            if (!isInFamily) {
                if (!profile.name) {
                    activeTab.set("onboardingProfile");
                } else {
                    activeTab.set("onboardingChoose");
                }
            }
        } catch (err: any) {
            console.warn("checkProfile error:", err);
            const status = err?.status ?? err?.response?.status;

            if (status === 401) {
                // Confirmed 401 Unauthorized with invalid or expired token
                clearTokens();
                removeCached("profile");
                isAuthed = false;
                isInFamily = false;
                setOffline(false);
            } else {
                // Network error, server offline, 5xx, or timeout:
                // Switch UI to offline mode while preserving authorization!
                setOffline(true);
                const cachedProfile = getCached<any>("profile");
                if (cachedProfile) {
                    isAuthed = true;
                    isInFamily = !!cachedProfile.is_family_member;
                } else if ($isLoggedInStore) {
                    // Token exists in store, retain authentication in offline state
                    isAuthed = true;
                }
            }
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

    async function handleFamilySuccess() {
        isInFamily = true;
        activeTab.set("statsScreen");
        try {
            const freshProfile = await getProfile();
            if (freshProfile) {
                setCached("profile", freshProfile);
                mutate("profile", freshProfile);
            }
            mutate("family-leaders");
            mutate("family-stats");
            mutate("family-events");
            mutate("family");
            mutate("family-members");
        } catch (e) {
            console.error("Failed to revalidate after family setup:", e);
        }
    }

    let contentEl: HTMLElement;

    $: if ($activeTab && contentEl) {
        contentEl.scrollTop = 0;
    }

    function screenIn(node: Element, { duration = 180 }: { duration?: number } = {}) {
        return {
            duration,
            easing: cubicOut,
            css: (t: number) => {
                const scale = 0.96 + 0.04 * t;
                return `
                    opacity: ${t};
                    transform: scale(${scale}) translateZ(0);
                    z-index: 2;
                `;
            }
        };
    }

    function screenOut(node: Element, { duration = 180 }: { duration?: number } = {}) {
        return {
            duration,
            easing: quadIn,
            css: (t: number) => {
                const scale = 0.96 + 0.04 * t;
                return `
                    opacity: ${t};
                    transform: scale(${scale}) translateZ(0);
                    pointer-events: none;
                    z-index: 1;
                `;
            }
        };
    }
</script>

<main>
    {#if isAuthed && $isOfflineStore}
        <div class="offline-banner" transition:slide={{ duration: 180 }}>
            <div class="offline-info">
                <Icon icon="material-symbols:cloud-off-rounded" width="16" height="16" />
                <span>{$t.common.offlineBanner || "Офлайн-режим • Сохранённые данные"}</span>
            </div>
            <button
                type="button"
                class="offline-retry-btn"
                on:click={() => checkProfile()}
            >
                {$t.common.retry || "Повторить"}
            </button>
        </div>
    {/if}

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
        <div class="screens-viewport">
            {#key $activeTab}
                <div
                    class="content"
                    bind:this={contentEl}
                    in:screenIn={{ duration: 180 }}
                    out:screenOut={{ duration: 180 }}
                >
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
                    {:else}
                        <StatsScreen />
                    {/if}
                </div>
            {/key}
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
        --bg-gradient: radial-gradient(120% 80% at 50% -10%, #FFF5ED 0%, #FAF7F2 48%, #F4ECE3 100%);
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
        --bg-gradient: radial-gradient(120% 80% at 50% -10%, #FFF0F4 0%, #FDF7F8 48%, #F7E8EF 100%);
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
        --bg-gradient: radial-gradient(100% 70% at 55% -10%, rgba(255, 154, 108, 0.09) 0%, transparent 68%), linear-gradient(180deg, #1D1823 0%, #17151B 45%, #110F14 100%);
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
        --bg-gradient: radial-gradient(120% 80% at 50% -10%, #EAF4FD 0%, #F2F8FC 48%, #E2EEF8 100%);
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

    /* ─── 5. Sage («Лесной оазис») ────────────────────────── */
    :global(body.sage),
    :global([data-theme="sage"]) {
        --bg: #F3F6F3;
        --bg-gradient: radial-gradient(120% 80% at 50% -10%, #EFF6F0 0%, #F3F6F3 48%, #E4EFE6 100%);
        --surface: #FFFFFF;
        --surface-alt: #E7EFE8;
        --bg-bar: rgba(255, 255, 255, 0.92);
        --text: #18241B;
        --text-primary: #18241B;
        --text-secondary: #495E4D;
        --text-muted: #7E9482;
        --text-nav: #556D59;
        --accent: #2E7D52;
        --accent-soft: rgba(46, 125, 82, 0.12);
        --accent-gradient: linear-gradient(135deg, #2E7D52 0%, #439969 100%);
        --accent-glow: rgba(46, 125, 82, 0.32);
        --accent-fg: #FFFFFF;
        --success: #287A49;
        --success-soft: rgba(40, 122, 73, 0.14);
        --border: rgba(126, 148, 130, 0.22);
        --border-subtle: rgba(126, 148, 130, 0.14);
        --divider: rgba(126, 148, 130, 0.1);
        --bg-nav: #FFFFFF;
        --nav-active-bg: rgba(46, 125, 82, 0.12);
        --nav-active-fg: #2E7D52;
        --shadow-card: 0 6px 20px -3px rgba(30, 55, 35, 0.06), 0 2px 6px -1px rgba(30, 55, 35, 0.04);
        --shadow-ambient: 0 4px 18px rgba(30, 55, 35, 0.05);
        --shadow-floating: 0 10px 28px -4px rgba(46, 125, 82, 0.34), 0 4px 12px rgba(30, 55, 35, 0.08);
        --shadow-nav: 0 -4px 20px rgba(30, 55, 35, 0.06);
        --blur-effect: none;
    }

    /* ─── 6. Midnight («Северное сияние») ─────────────────── */
    :global(body.midnight),
    :global([data-theme="midnight"]) {
        --bg: #0E121A;
        --bg-gradient: radial-gradient(100% 70% at 50% -10%, rgba(99, 102, 241, 0.11) 0%, transparent 68%), linear-gradient(180deg, #131925 0%, #0E121A 45%, #090C12 100%);
        --surface: #161C26;
        --surface-alt: #1F2735;
        --bg-bar: rgba(22, 28, 38, 0.94);
        --text: #F0F4FC;
        --text-primary: #F0F4FC;
        --text-secondary: #A0B0C6;
        --text-muted: #697A92;
        --text-nav: #A0B0C6;
        --accent: #6366F1;
        --accent-soft: rgba(99, 102, 241, 0.16);
        --accent-gradient: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);
        --accent-glow: rgba(99, 102, 241, 0.35);
        --accent-fg: #FFFFFF;
        --success: #10B981;
        --success-soft: rgba(16, 185, 129, 0.16);
        --border: rgba(255, 255, 255, 0.11);
        --border-subtle: rgba(255, 255, 255, 0.07);
        --divider: rgba(255, 255, 255, 0.06);
        --bg-nav: #161C26;
        --nav-active-bg: rgba(99, 102, 241, 0.18);
        --nav-active-fg: #818CF8;
        --shadow-card: 0 8px 24px -4px rgba(0, 0, 0, 0.55), 0 2px 8px -1px rgba(0, 0, 0, 0.4);
        --shadow-ambient: 0 4px 18px rgba(0, 0, 0, 0.4);
        --shadow-floating: 0 10px 28px -4px rgba(99, 102, 241, 0.38), 0 4px 12px rgba(0, 0, 0, 0.45);
        --shadow-nav: 0 -4px 22px rgba(0, 0, 0, 0.5);
        --blur-effect: none;
    }

    /* ─── 7. Amber («Медовый полдень») ────────────────────── */
    :global(body.amber),
    :global([data-theme="amber"]) {
        --bg: #FAF7EE;
        --bg-gradient: radial-gradient(120% 80% at 50% -10%, #FFF8E6 0%, #FAF7EE 48%, #F4EAD4 100%);
        --surface: #FFFFFF;
        --surface-alt: #F4EEDC;
        --bg-bar: rgba(255, 255, 255, 0.92);
        --text: #282015;
        --text-primary: #282015;
        --text-secondary: #66553B;
        --text-muted: #9E8867;
        --text-nav: #736145;
        --accent: #D97706;
        --accent-soft: rgba(217, 119, 6, 0.12);
        --accent-gradient: linear-gradient(135deg, #D97706 0%, #F59E0B 100%);
        --accent-glow: rgba(217, 119, 6, 0.32);
        --accent-fg: #FFFFFF;
        --success: #16A34A;
        --success-soft: rgba(22, 163, 74, 0.14);
        --border: rgba(158, 136, 103, 0.22);
        --border-subtle: rgba(158, 136, 103, 0.14);
        --divider: rgba(158, 136, 103, 0.1);
        --bg-nav: #FFFFFF;
        --nav-active-bg: rgba(217, 119, 6, 0.12);
        --nav-active-fg: #D97706;
        --shadow-card: 0 6px 20px -3px rgba(60, 45, 20, 0.06), 0 2px 6px -1px rgba(60, 45, 20, 0.04);
        --shadow-ambient: 0 4px 18px rgba(60, 45, 20, 0.05);
        --shadow-floating: 0 10px 28px -4px rgba(217, 119, 6, 0.35), 0 4px 12px rgba(60, 45, 20, 0.08);
        --shadow-nav: 0 -4px 20px rgba(60, 45, 20, 0.06);
        --blur-effect: none;
    }

    :global(body) {
        background-color: var(--bg);
        background-image: var(--bg-gradient);
        background-attachment: fixed;
        background-size: cover;
        background-repeat: no-repeat;
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
        background-color: var(--bg);
        background-image: var(--bg-gradient);
        background-attachment: fixed;
        background-size: cover;
        background-repeat: no-repeat;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }

    .offline-banner {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: max(8px, env(safe-area-inset-top)) 16px 8px;
        background: color-mix(in srgb, var(--accent) 15%, var(--surface));
        border-bottom: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 600;
        z-index: 50;
    }

    .offline-info {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    .offline-info span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .offline-retry-btn {
        background: var(--accent);
        color: var(--accent-fg, #fff);
        border: none;
        border-radius: 999px;
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.1s ease, opacity 0.15s ease;
    }

    .offline-retry-btn:active {
        transform: scale(0.96);
        opacity: 0.85;
    }

    .screens-viewport {
        flex: 1;
        min-height: 0;
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: grid;
        grid-template-columns: 100%;
        grid-template-rows: 100%;
        background-color: var(--bg);
        background-image: var(--bg-gradient);
        background-attachment: fixed;
        background-size: cover;
        background-repeat: no-repeat;
    }

    .content {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        position: relative;
        padding-top: calc(env(safe-area-inset-top));
        padding-bottom: calc(84px + env(safe-area-inset-bottom));
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
        background-color: var(--bg);
        background-image: var(--bg-gradient);
        background-attachment: fixed;
        background-size: cover;
        background-repeat: no-repeat;
        transform-origin: center center;
        will-change: transform, opacity;
        scrollbar-width: none;
    }

    .content::-webkit-scrollbar {
        display: none;
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
        padding: 8px 16px calc(10px + env(safe-area-inset-bottom));
        background: color-mix(in srgb, var(--bg-nav) 80%, transparent);
        -webkit-backdrop-filter: blur(28px) saturate(190%);
        backdrop-filter: blur(28px) saturate(190%);
        border-top: 0.5px solid var(--border-subtle);
        border-radius: 24px 24px 0 0;
        box-shadow: 0 -4px 24px -2px rgba(0, 0, 0, 0.04);
    }

    /* ── ITEM ────────────────────────────────────── */
    .nav-item {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        min-height: 44px;
        padding: 4px 2px;
        border: none;
        border-radius: 999px;
        background: transparent;
        color: var(--text-nav);
        font-family: inherit;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform 0.14s cubic-bezier(0.25, 1, 0.5, 1), color 0.16s ease;
    }

    .nav-item:active {
        transform: scale(0.92) translateZ(0);
    }

    /* ── ICON WRAP ───────────────────────────────── */
    .nav-icon {
        width: 44px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: transparent;
        transition:
            background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .nav-item :global(svg) {
        transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
    }

    /* ── LABEL ───────────────────────────────────── */
    .nav-label {
        font-size: 10.5px;
        font-weight: 500;
        color: var(--text-nav);
        letter-spacing: -0.15px;
        transition:
            color 0.16s ease,
            transform 0.16s ease,
            font-weight 0.16s ease;
        line-height: 1.1;
    }

    /* ── ACTIVE ──────────────────────────────────── */
    .nav-item.active {
        color: var(--nav-active-fg);
    }

    .nav-item.active .nav-icon {
        background: var(--nav-active-bg);
        transform: translateY(-1.5px);
    }

    .nav-item.active .nav-icon :global(svg) {
        transform: scale(1.06);
    }

    .nav-item.active .nav-label {
        color: var(--nav-active-fg);
        font-weight: 600;
        letter-spacing: -0.2px;
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
        background-image: var(--bg-gradient);
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
