<script lang="ts">
    import { scale, fade, slide } from "svelte/transition";
    import { activeTab } from "$lib/navigation";
    import { joinFamilyByCode } from "$lib/familyStore";
    import { t } from "$lib/i18n";

    import BackButton from "$ui/backbtn.svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import Icon from "@iconify/svelte";

    import type { FamilyProfile } from "$types/index";

    export let onSuccess: (family: FamilyProfile) => void;

    let codeInputRaw = "";
    let isLoading = false;
    let isSuccess = false;
    let successData: FamilyProfile | null = null;
    let errorMessage = "";

    function formatCode(value: string): string {
        const clean = value
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase()
            .slice(0, 6);

        return clean.length > 3
            ? `${clean.slice(0, 3)}-${clean.slice(3)}`
            : clean;
    }

    function handleInput(event: Event) {
        const input = event.target as HTMLInputElement;
        codeInputRaw = formatCode(input.value);

        if (errorMessage) {
            errorMessage = "";
        }
    }

    async function handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                codeInputRaw = formatCode(text);
                if (errorMessage) errorMessage = "";
            }
        } catch {
            // Clipboard not allowed
        }
    }

    async function handleJoinByCode() {
        const clean = codeInputRaw.replace("-", "").trim();

        if (clean.length < 6) {
            errorMessage = $t.onboarding.enterFullCodeError || "Введите полный 6-значный код (например, ABC-123)";
            return;
        }

        isLoading = true;
        errorMessage = "";

        try {
            const [profile] = await Promise.all([
                joinFamilyByCode(clean),
                new Promise((resolve) => setTimeout(resolve, 1000)),
            ]);

            successData = profile;
            isSuccess = true;
        } catch {
            errorMessage = $t.onboarding.familyNotFoundError || "Семья с таким кодом не найдена";
        } finally {
            isLoading = false;
        }
    }

    function handleBack() {
        activeTab.set("onboardingChoose");
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
                <h1 class="success-title">{$t.onboarding.youAreInCircle || "Вы в семейном круге!"}</h1>
                <p class="success-subtitle">{$t.onboarding.familyCreatedSubtitle || "Добро пожаловать домой"}</p>

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
                <div class="loader-avatar">
                    <Icon
                        icon="material-symbols:family-home-rounded"
                        width="40"
                        height="40"
                    />
                    <div class="spin-ring"></div>
                </div>

                <h2 class="loader-title">{$t.onboarding.searchingFamily || "Ищем семью..."}</h2>
                <p class="loader-subtitle">{$t.onboarding.checkingCode || "Проверяем код приглашения"}</p>
            </div>
        </div>
    {:else}
        <!-- FORM -->
        <header class="onboarding-header">
            <BackButton on:click={handleBack} />

            <div class="header-info">
                <span class="header-step">{$t.onboarding.joining || "Присоединение"}</span>
                <h2 class="screen-title">{$t.onboarding.enterFamilyCircle || "Вход в семью"}</h2>
            </div>
        </header>

        <main class="content">
            <section class="intro">
                <div class="intro-icon">
                    <Icon
                        icon="material-symbols:group-add-rounded"
                        width="36"
                        height="36"
                    />
                </div>

                <div class="intro-text">
                    <h1>{$t.onboarding.inviteCodeHeader || "Код приглашения"}</h1>
                    <p>{$t.onboarding.inviteCodeSubtitle || "Введите код, который вам отправил член вашей семьи."}</p>
                </div>
            </section>

            <section class="code-card">
                <div class="code-card-header">
                    <label for="invite-code-input" class="code-label">
                        {$t.onboarding.inviteCodeLabel || "Код приглашения"}
                    </label>
                    <button type="button" class="paste-btn" on:click={handlePaste}>
                        <Icon icon="material-symbols:content-paste-rounded" width="14" height="14" />
                        <span>Вставить</span>
                    </button>
                </div>

                <input
                    id="invite-code-input"
                    type="text"
                    placeholder="AAA-000"
                    bind:value={codeInputRaw}
                    class="code-input"
                    autocomplete="off"
                    autocapitalize="characters"
                    spellcheck="false"
                    inputmode="text"
                    maxlength="7"
                    on:input={handleInput}
                />

                <span class="code-subtext">{$t.onboarding.codeSubtext || "Формат: 6 символов, например ABC-123"}</span>

                {#if errorMessage}
                    <div class="error-message" transition:slide={{ duration: 180 }}>
                        <Icon icon="material-symbols:error-rounded" width="18" height="18" />
                        <span>{errorMessage}</span>
                    </div>
                {/if}

                <div class="hint">
                    <div class="hint-icon">
                        <Icon icon="material-symbols:info-rounded" width="15" height="15" />
                    </div>
                    <span>{$t.onboarding.codeHint || "Код можно узнать у администратора вашей семьи в настройках."}</span>
                </div>
            </section>

            <div class="actions">
                <ButtonPrimaryGlow
                    label={$t.onboarding.joinFamily || "Присоединиться"}
                    on:click={handleJoinByCode}
                    disabled={codeInputRaw.replace("-", "").trim().length < 6}
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

        background: transparent;
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
        gap: 20px;
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

    /* ── Code Card ── */
    .code-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: var(--surface);
        padding: 20px;
        border-radius: var(--radius-card, 22px);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
    }

    .code-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .code-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.2px;
    }

    .paste-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--accent);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s ease;
    }

    .paste-btn:active {
        transform: scale(0.95);
    }

    .code-input {
        width: 100%;
        box-sizing: border-box;
        padding: 16px 14px;
        border-radius: 16px;
        background: var(--surface-alt);
        border: 1.5px solid var(--border-subtle);
        color: var(--accent);
        font-family: "SF Mono", Monaco, "Cascadia Code", monospace, sans-serif;
        font-size: 26px;
        font-weight: 800;
        letter-spacing: 4px;
        text-align: center;
        text-transform: uppercase;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .code-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .code-input::placeholder {
        color: var(--text-muted);
        opacity: 0.4;
        letter-spacing: 3px;
    }

    .code-subtext {
        font-size: 11px;
        color: var(--text-muted);
        text-align: center;
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
        background: var(--accent-soft);
        color: var(--accent);
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
