<script lang="ts">
    import { slide } from "svelte/transition";
    import { activeTab, onboardingParams } from "$lib/navigation";
    import { t } from "$lib/i18n";

    import BackButton from "$ui/backbtn.svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import CustomInput from "$ui/CustomInput.svelte";
    import Icon from "@iconify/svelte";

    let errorMessage = "";

    $: familyName = $onboardingParams.familyForm.name;

    function handleNameChange(value: string) {
        onboardingParams.update((p) => ({
            ...p,
            familyForm: {
                ...p.familyForm,
                name: value,
            },
        }));

        if (errorMessage) {
            errorMessage = "";
        }
    }

    function handleNext() {
        if (!familyName.trim()) {
            errorMessage = $t.onboarding.nameRequired;
            return;
        }

        errorMessage = "";
        activeTab.set("onboardingCreateStep2");
    }

    function handleBack() {
        activeTab.set("onboardingChoose");
    }
</script>

<div class="onboarding-screen">
    <header class="onboarding-header">
        <BackButton on:click={handleBack} />

        <div class="header-info">
            <span class="header-step">{$t.onboarding.step1Of2}</span>
            <h2 class="screen-title">{$t.onboarding.createFamily}</h2>
        </div>
    </header>

    <main class="content">
        <!-- Intro -->
        <section class="intro">
            <div class="intro-icon">
                <Icon
                    icon="material-symbols:family-home-rounded"
                    width="34"
                    height="34"
                />
            </div>

            <div class="intro-text">
                <h1>{$t.onboarding.step1Title}</h1>

                <p>
                    {$t.onboarding.step1Subtitle}
                </p>
            </div>
        </section>

        <!-- Form -->
        <section class="form">
            <label class="field-label" for="family-name">
                {$t.onboarding.familyNameLabel}
            </label>

            <CustomInput
                value={familyName}
                on:inputChange={(e) => handleNameChange(e.detail)}
                icon="🏡"
                placeholder={$t.onboarding.familyPlaceholder}
                maxlength={36}
            />

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

            <div class="hint">
                <div class="hint-icon">
                    <Icon
                        icon="material-symbols:edit-rounded"
                        width="15"
                        height="15"
                    />
                </div>

                <span>{$t.onboarding.step1Hint}</span>
            </div>
        </section>

        <!-- Actions -->
        <div class="actions">
            <ButtonPrimaryGlow label={$t.onboarding.continueBtn} on:click={handleNext} />
        </div>
    </main>
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

        text-transform: uppercase;
        letter-spacing: 0.08em;

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
        min-height: 0;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        margin: 0 auto;
        padding: 26px 20px 28px;
    }

    /* ───────────────── Intro ───────────────── */

    .intro {
        display: flex;
        flex-direction: column;
        align-items: center;

        text-align: center;

        margin-bottom: 34px;
    }

    .intro-icon {
        width: 68px;
        height: 68px;

        display: flex;
        align-items: center;
        justify-content: center;

        margin-bottom: 18px;

        border-radius: 21px;

        color: var(--accent);

        background: color-mix(in srgb, var(--accent) 13%, transparent);

        border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);

        box-shadow:
            0 10px 28px color-mix(in srgb, var(--accent) 9%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .intro-text h1 {
        margin: 0 0 9px;

        font-size: 27px;
        line-height: 1.15;
        font-weight: 800;
        letter-spacing: -0.7px;

        color: var(--text-primary);
    }

    .intro-text p {
        max-width: 370px;

        margin: 0 auto;

        font-size: 14px;
        line-height: 1.55;

        color: var(--text-secondary);
    }

    /* ───────────────── Form ───────────────── */

    .form {
        display: flex;
        flex-direction: column;

        width: 100%;
    }

    .field-label {
        margin: 0 0 8px 2px;

        font-size: 12px;
        line-height: 1.2;
        font-weight: 650;

        color: var(--text-primary);
    }

    /* ───────────────── Error ───────────────── */

    .error-message {
        display: flex;
        align-items: center;
        gap: 8px;

        margin-top: 9px;
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

        margin-top: 13px;
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

        margin-top: 30px;
    }
</style>
