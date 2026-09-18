<script lang="ts">
    import { slide } from "svelte/transition";
    import { activeTab, onboardingParams } from "$lib/navigation";
    import { t } from "$lib/i18n";

    import BackButton from "$ui/backbtn.svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import Icon from "@iconify/svelte";

    let errorMessage = "";

    $: familyName = $onboardingParams.familyForm.name;

    const SUGGESTIONS = [
        "Семья Смирновых",
        "Уютный дом",
        "Наш очаг",
        "Family Circle",
    ];

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

    function applySuggestion(s: string) {
        handleNameChange(s);
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
                    width="36"
                    height="36"
                />
            </div>

            <div class="intro-text">
                <h1>{$t.onboarding.step1Title}</h1>
                <p>{$t.onboarding.step1Subtitle}</p>
            </div>
        </section>

        <!-- Form -->
        <section class="form-card">
            <label class="field-label" for="family-name">
                {$t.onboarding.familyNameLabel || "Название семьи"}
            </label>

            <div class="input-wrapper">
                <span class="input-icon">🏡</span>
                <input
                    id="family-name"
                    class="field-input"
                    type="text"
                    value={familyName}
                    on:input={(e) => handleNameChange(e.currentTarget.value)}
                    placeholder={$t.onboarding.familyPlaceholder || "Например: Супер Семейка"}
                    maxlength={40}
                    autocomplete="off"
                />
            </div>

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

            <!-- Suggestions -->
            <div class="suggestions">
                <span class="sugg-label">Подсказки:</span>
                <div class="sugg-chips">
                    {#each SUGGESTIONS as sugg}
                        <button
                            type="button"
                            class="chip"
                            class:chip-active={familyName === sugg}
                            on:click={() => applySuggestion(sugg)}
                        >
                            {sugg}
                        </button>
                    {/each}
                </div>
            </div>

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
        padding: 20px 18px max(24px, env(safe-area-inset-bottom));

        display: flex;
        flex-direction: column;
        gap: 24px;
        flex: 1;
    }

    /* ── Intro ── */
    .intro {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding-top: 4px;
    }

    .intro-icon {
        width: 68px;
        height: 68px;
        border-radius: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent);
        background: var(--accent-soft);
        border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
        box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 15%, transparent);
        margin-bottom: 16px;
    }

    .intro-text h1 {
        margin: 0 0 8px;
        font-size: 26px;
        line-height: 1.15;
        font-weight: 800;
        letter-spacing: -0.6px;
        color: var(--text-primary);
    }

    .intro-text p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-secondary);
        max-width: 360px;
    }

    /* ── Form Card ── */
    .form-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: var(--surface);
        padding: 18px;
        border-radius: var(--radius-card, 22px);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
    }

    .field-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.2px;
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .input-icon {
        position: absolute;
        left: 14px;
        font-size: 18px;
        pointer-events: none;
        user-select: none;
    }

    .field-input {
        width: 100%;
        box-sizing: border-box;
        padding: 14px 14px 14px 44px;
        border-radius: 14px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .field-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .field-input::placeholder {
        color: var(--text-muted);
        font-weight: 500;
    }

    /* ── Suggestions ── */
    .suggestions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 2px;
    }

    .sugg-label {
        font-size: 11px;
        color: var(--text-muted);
        font-weight: 600;
    }

    .sugg-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .chip {
        padding: 6px 12px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s ease;
    }

    .chip:active, .chip-active {
        background: var(--accent-soft);
        border-color: var(--accent);
        color: var(--accent);
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
        margin-top: 4px;
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
</style>
