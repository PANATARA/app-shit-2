<script lang="ts">
    import { scale, fade, slide } from "svelte/transition";
    import { activeTab, onboardingParams } from "$lib/navigation";
    import { createFamily } from "$api/family";

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
                new Promise((resolve) => setTimeout(resolve, 1400)),
            ]);

            successData = profile;
            isSuccess = true;
        } catch {
            errorMessage = "Не удалось создать семью. Попробуйте ещё раз.";
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="onboarding-screen">
    {#if isSuccess && successData}
        <!-- SUCCESS -->

        <div
            class="success-container"
            in:scale={{ duration: 450, start: 0.92 }}
        >
            <div class="success-card">
                <div class="success-glow"></div>

                <div class="success-avatar">
                    <Icon
                        icon={successData.icon}
                        width="58"
                        height="58"
                        color={successData.icon_color}
                    />

                    <div class="success-check">
                        <Icon
                            icon="material-symbols:check-rounded"
                            width="17"
                            height="17"
                        />
                    </div>
                </div>

                <span class="success-label"> Всё готово </span>

                <h1 class="success-title">Семья создана!</h1>

                <p class="success-subtitle">Добро пожаловать в семейный круг</p>

                <div class="family-name">
                    «{successData.name}»
                </div>

                <ButtonPrimaryGlow
                    label="Войти в семейный круг"
                    on:click={() => onSuccess(successData)}
                />
            </div>
        </div>
    {:else if isLoading}
        <!-- LOADING -->

        <div class="loader-container" in:fade={{ duration: 220 }}>
            <div class="loader-content">
                <div class="loader-avatar">
                    <div class="loader-ring loader-ring-outer"></div>
                    <div class="loader-ring loader-ring-inner"></div>

                    <div
                        class="loader-icon"
                        style="background: {$onboardingParams.familyForm.icon_bg}"
                    >
                        <Icon
                            icon={$onboardingParams.familyForm.icon}
                            width="34"
                            height="34"
                            color={$onboardingParams.familyForm.icon_color}
                        />
                    </div>
                </div>

                <div class="loader-text">
                    <h2>Создаём вашу семью</h2>

                    <p>Подготавливаем семейное пространство...</p>
                </div>

                <div class="loader-progress">
                    <div class="loader-progress-fill"></div>
                </div>
            </div>
        </div>
    {:else}
        <!-- FORM -->

        <header class="onboarding-header">
            <BackButton
                on:click={() => activeTab.set("onboardingCreateStep1")}
            />

            <div class="header-info">
                <span class="header-step"> Шаг 2 из 2 </span>

                <h2 class="screen-title">Аватар семейного круга</h2>
            </div>
        </header>

        <main class="content">
            <!-- Avatar -->
            <section class="avatar-section">
                <div class="avatar-card">
                    <AvatarConstructor
                        initialIcon={$onboardingParams.familyForm.icon}
                        initialIconColor={$onboardingParams.familyForm
                            .icon_color}
                        initialBg={$onboardingParams.familyForm.icon_bg}
                        onchange={(e) => {
                            updateAvatar(e.icon, e.icon_color, e.icon_bg);
                        }}
                    />
                </div>
            </section>

            {#if errorMessage}
                <div class="error-message" transition:slide={{ duration: 180 }}>
                    <Icon
                        icon="material-symbols:error-rounded"
                        width="18"
                        height="18"
                    />

                    <span>{errorMessage}</span>
                </div>
            {/if}

            <!-- Hint -->

            <div class="hint">
                <div class="hint-icon">
                    <Icon
                        icon="material-symbols:palette-rounded"
                        width="16"
                        height="16"
                    />
                </div>

                <span> Аватар можно изменить позже в настройках семьи. </span>
            </div>

            <!-- Actions -->

            <div class="actions">
                <ButtonPrimaryGlow
                    label="Создать семью"
                    on:click={handleFinishCreate}
                />
            </div>
        </main>
    {/if}
</div>

<style>
    .onboarding-screen {
        width: 100%;
        min-height: 100dvh;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        background: var(--bg);
        color: var(--text-primary);
    }

    /* ───────────────── Header ───────────────── */

    .onboarding-header {
        display: flex;
        align-items: center;
        gap: 12px;

        padding: 8px 10px 0px;
    }

    .header-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .header-step {
        font-size: 10px;
        line-height: 1;

        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;

        color: var(--accent);
    }

    .screen-title {
        margin: 0;

        font-size: 19px;
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: -0.35px;

        color: var(--text-primary);
    }

    /* ───────────────── Content ───────────────── */

    .content {
        width: 100%;
        max-width: 520px;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        margin: 0 auto;
        padding: 26px 20px 28px;
    }

    /* ───────────────── Avatar ───────────────── */

    .avatar-section {
        width: 100%;
    }

    .avatar-card {
        width: 100%;
        box-sizing: border-box;

        display: flex;
        justify-content: center;

        padding: 4px 0;
    }

    /* ───────────────── Error ───────────────── */

    .error-message {
        display: flex;
        align-items: center;
        gap: 8px;

        margin-top: 12px;
        padding: 10px 12px;

        border-radius: 12px;

        color: #ef7777;

        background: rgba(239, 68, 68, 0.09);
        border: 1px solid rgba(239, 68, 68, 0.16);

        font-size: 12px;
        line-height: 1.35;
    }

    .error-message :global(svg) {
        flex-shrink: 0;
    }

    /* ───────────────── Hint ───────────────── */

    .hint {
        display: flex;
        align-items: center;
        gap: 9px;

        margin-top: 14px;
        padding: 10px 12px;

        border-radius: 12px;

        background: rgba(255, 255, 255, 0.025);
        border: 1px solid rgba(255, 255, 255, 0.045);
    }

    .hint-icon {
        flex: 0 0 27px;

        width: 27px;
        height: 27px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 8px;

        color: var(--accent);

        background: color-mix(in srgb, var(--accent) 9%, transparent);
    }

    .hint span {
        font-size: 11px;
        line-height: 1.4;

        color: var(--text-secondary);
    }

    /* ───────────────── Actions ───────────────── */

    .actions {
        width: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;

        margin-top: 25px;
    }

    /* ───────────────── Loader ───────────────── */

    .loader-container {
        flex: 1;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 24px;
    }

    .loader-content {
        width: 100%;
        max-width: 300px;

        display: flex;
        flex-direction: column;
        align-items: center;

        text-align: center;
    }

    .loader-avatar {
        position: relative;

        width: 88px;
        height: 88px;

        display: flex;
        align-items: center;
        justify-content: center;

        margin-bottom: 28px;
    }

    .loader-ring {
        position: absolute;

        border-radius: 50%;
        box-sizing: border-box;
    }

    .loader-ring-outer {
        inset: 0;

        border: 2px solid color-mix(in srgb, var(--accent) 20%, transparent);

        animation: ping 2s ease-out infinite;
    }

    .loader-ring-inner {
        inset: 7px;

        border: 3px solid var(--surface-alt);
        border-top-color: var(--accent);

        animation: spin 1.1s linear infinite;
    }

    .loader-icon {
        width: 50px;
        height: 50px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 16px;
    }

    .loader-text h2 {
        margin: 0 0 7px;

        font-size: 18px;
        font-weight: 800;
    }

    .loader-text p {
        margin: 0;

        font-size: 12px;
        color: var(--text-secondary);
    }

    .loader-progress {
        width: 130px;
        height: 4px;

        overflow: hidden;

        margin-top: 22px;

        border-radius: 99px;

        background: var(--surface-alt);
    }

    .loader-progress-fill {
        width: 100%;
        height: 100%;

        transform-origin: left;

        background: var(--accent);

        animation: loadFill 1.4s ease-in-out infinite;
    }

    /* ───────────────── Success ───────────────── */

    .success-container {
        flex: 1;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 24px;
    }

    .success-card {
        position: relative;

        width: 100%;
        max-width: 390px;

        box-sizing: border-box;

        padding: 38px 24px 28px;

        overflow: hidden;

        text-align: center;

        border: 1px solid var(--border);
        border-radius: 28px;

        background: var(--surface);

        box-shadow: var(--shadow);
    }

    .success-glow {
        position: absolute;

        width: 180px;
        height: 180px;

        top: -110px;
        left: 50%;

        transform: translateX(-50%);

        border-radius: 50%;

        background: color-mix(in srgb, var(--accent) 16%, transparent);

        filter: blur(25px);

        pointer-events: none;
    }

    .success-avatar {
        position: relative;

        width: 88px;
        height: 88px;

        display: flex;
        align-items: center;
        justify-content: center;

        margin: 0 auto 18px;

        border-radius: 50%;

        background: var(--surface-alt);

        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);

        animation: popIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .success-check {
        position: absolute;

        right: -2px;
        bottom: -1px;

        width: 27px;
        height: 27px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 50%;

        color: var(--bg);
        background: var(--success);

        border: 3px solid var(--surface);

        animation: checkScale 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.5) 0.45s
            both;
    }

    .success-label {
        display: block;

        margin-bottom: 5px;

        font-size: 10px;
        font-weight: 700;

        letter-spacing: 0.08em;
        text-transform: uppercase;

        color: var(--accent);
    }

    .success-title {
        margin: 0 0 7px;

        font-size: 23px;
        font-weight: 850;
        letter-spacing: -0.5px;
    }

    .success-subtitle {
        margin: 0;

        font-size: 13px;
        line-height: 1.45;

        color: var(--text-secondary);
    }

    .family-name {
        margin: 6px 0 25px;

        font-size: 18px;
        font-weight: 800;

        color: var(--accent);
    }

    /* ───────────────── Animations ───────────────── */

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes ping {
        0% {
            transform: scale(0.8);
            opacity: 0.6;
        }

        100% {
            transform: scale(1.65);
            opacity: 0;
        }
    }

    @keyframes loadFill {
        0% {
            transform: scaleX(0);
        }

        50% {
            transform: scaleX(0.72);
        }

        100% {
            transform: scaleX(1);
        }
    }

    @keyframes popIn {
        from {
            transform: scale(0.55);
            opacity: 0;
        }

        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    @keyframes checkScale {
        from {
            transform: scale(0);
        }

        to {
            transform: scale(1);
        }
    }
</style>
