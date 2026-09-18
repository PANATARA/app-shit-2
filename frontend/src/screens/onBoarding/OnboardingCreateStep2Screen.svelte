<script lang="ts">
    import { scale, fade, slide } from "svelte/transition";
    import { activeTab, onboardingParams } from "$lib/navigation";
    import { createFamily } from "$api/family";
    import { t } from "$lib/i18n";

    import AvatarConstructor from "$features/settings/AvatarBuilder.svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import BackButton from "$ui/backbtn.svelte";
    import Icon from "@iconify/svelte";

    import type { FamilyProfile } from "$types/index";

    export let onSuccess: (family: FamilyProfile) => void;

    let isLoading = false;
    let isSuccess = false;
    let successData: FamilyProfile | null = null;
    let errorMessage = "";

    function updateAvatar(icon: string, icon_color: string, icon_bg: string) {
        onboardingParams.update((p) => ({
            ...p,
            familyForm: {
                ...p.familyForm,
                icon,
                icon_color,
                icon_bg,
            },
        }));
    }

    async function handleFinishCreate() {
        isLoading = true;
        errorMessage = "";

        try {
            const [profile] = await Promise.all([
                createFamily($onboardingParams.familyForm),
                new Promise((resolve) => setTimeout(resolve, 1000)),
            ]);

            successData = profile;
            isSuccess = true;
        } catch {
            errorMessage = $t.onboarding.createFamilyError;
        } finally {
            isLoading = false;
        }
    }

    function handleBack() {
        activeTab.set("onboardingCreateStep1");
    }
</script>

<div class="onboarding-screen">
    {#if isSuccess && successData}
        <!-- SUCCESS -->
        <div class="state-container" in:scale={{ duration: 400, start: 0.94 }}>
            <div class="success-card">
                <div class="success-avatar" style="background: {successData.icon_bg}">
                    <Icon
                        icon={successData.icon}
                        width="54"
                        height="54"
                        color={successData.icon_color}
                    />
                    <div class="success-check">
                        <Icon icon="material-symbols:check-rounded" width="16" height="16" />
                    </div>
                </div>

                <span class="success-label">{$t.onboarding.allDone || "Всё готово"}</span>
                <h1 class="success-title">{$t.onboarding.familyCreatedTitle || "Семья создана!"}</h1>
                <p class="success-subtitle">{$t.onboarding.familyCreatedSubtitle || "Добро пожаловать в семейный круг"}</p>

                <div class="family-name-pill">
                    «{successData.name}»
                </div>

                <div class="state-action">
                    <ButtonPrimaryGlow
                        label={$t.onboarding.enterFamily || "Войти в семейный круг"}
                        on:click={() => onSuccess(successData)}
                    />
                </div>
            </div>
        </div>
    {:else if isLoading}
        <!-- LOADING -->
        <div class="state-container" in:fade={{ duration: 200 }}>
            <div class="loader-card">
                <div class="loader-avatar" style="background: {$onboardingParams.familyForm.icon_bg}">
                    <Icon
                        icon={$onboardingParams.familyForm.icon}
                        width="44"
                        height="44"
                        color={$onboardingParams.familyForm.icon_color}
                    />
                    <div class="spin-ring"></div>
                </div>

                <h2 class="loader-title">{$t.onboarding.creatingFamily || "Создаём семью..."}</h2>
                <p class="loader-subtitle">{$t.onboarding.creatingSubtitle || "Подготавливаем семейное пространство"}</p>
            </div>
        </div>
    {:else}
        <!-- FORM -->
        <header class="onboarding-header">
            <BackButton on:click={handleBack} />

            <div class="header-info">
                <span class="header-step">{$t.onboarding.step2Of2}</span>
                <h2 class="screen-title">{$t.onboarding.step2Title}</h2>
            </div>
        </header>

        <main class="content">
            <section class="avatar-section">
                <div class="avatar-builder-card">
                    <AvatarConstructor
                        initialIcon={$onboardingParams.familyForm.icon || "material-symbols:house-rounded"}
                        initialIconColor={$onboardingParams.familyForm.icon_color || "#ffffff"}
                        initialBg={$onboardingParams.familyForm.icon_bg || "linear-gradient(135deg, #F97316 0%, #FB7185 100%)"}
                        allowIcon={true}
                        allowIconColor={false}
                        allowBg={true}
                        iconCategories={["home", "nature", "pets", "misc"]}
                        onchange={(e) => {
                            updateAvatar(e.icon, e.icon_color, e.icon_bg);
                        }}
                    />
                </div>
            </section>

            {#if errorMessage}
                <div class="error-message" transition:slide={{ duration: 180 }}>
                    <Icon icon="material-symbols:error-rounded" width="18" height="18" />
                    <span>{errorMessage}</span>
                </div>
            {/if}

            <div class="hint">
                <div class="hint-icon">
                    <Icon icon="material-symbols:palette-rounded" width="16" height="16" />
                </div>
                <span>{$t.onboarding.avatarHint}</span>
            </div>

            <div class="actions">
                <ButtonPrimaryGlow
                    label={$t.onboarding.createFamilyBtn || "Создать семью"}
                    on:click={handleFinishCreate}
                />
            </div>
        </main>
    {/if}
</div>

<style>
    .onboarding-screen {
        width: 100%;
        height: 100dvh;
        max-height: 100dvh;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        background: var(--bg);
        color: var(--text-primary);
    }

    /* ── Header ── */
    .onboarding-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: max(12px, env(safe-area-inset-top)) 16px 0;
    }

    .header-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .header-step {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent);
    }

    .screen-title {
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.3px;
        color: var(--text-primary);
    }

    /* ── Content ── */
    .content {
        width: 100%;
        max-width: 480px;
        box-sizing: border-box;
        margin: 0 auto;
        padding: 16px 18px max(24px, env(safe-area-inset-bottom));

        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1;
    }

    .avatar-builder-card {
        background: var(--surface);
        padding: 14px 14px 18px;
        border-radius: var(--radius-card, 22px);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
    }

    /* ── Error ── */
    .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 12px;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        font-size: 12px;
        font-weight: 600;
    }

    /* ── Hint ── */
    .hint {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
    }

    .hint-icon {
        flex: 0 0 24px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 7px;
        color: var(--accent);
        background: var(--accent-soft);
    }

    .hint span {
        font-size: 11px;
        line-height: 1.4;
        color: var(--text-secondary);
    }

    /* ── Actions ── */
    .actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: auto;
        padding-top: 8px;
    }

    /* ── States (Success / Loader) ── */
    .state-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 20px;
    }

    .success-card, .loader-card {
        width: 100%;
        max-width: 360px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 32px 24px;
        border-radius: var(--radius-card, 28px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
    }

    .success-avatar {
        position: relative;
        width: 96px;
        height: 96px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
    }

    .success-check {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--success);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid var(--surface);
    }

    .success-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent);
        margin-bottom: 6px;
    }

    .success-title {
        margin: 0 0 6px;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: var(--text-primary);
    }

    .success-subtitle {
        margin: 0 0 18px;
        font-size: 14px;
        color: var(--text-secondary);
    }

    .family-name-pill {
        padding: 8px 18px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--accent);
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 24px;
    }

    .state-action {
        width: 100%;
    }

    /* ── Loader ── */
    .loader-avatar {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
    }

    .spin-ring {
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: var(--accent);
        border-right-color: var(--accent);
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .loader-title {
        margin: 0 0 6px;
        font-size: 20px;
        font-weight: 800;
        color: var(--text-primary);
    }

    .loader-subtitle {
        margin: 0;
        font-size: 13px;
        color: var(--text-secondary);
    }
</style>
