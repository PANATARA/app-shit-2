<script lang="ts">
    import { scale, fade, slide } from "svelte/transition";
    import { activeTab } from "$lib/navigation";
    import { joinFamily } from "$api/family";

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

    async function handleJoinByCode() {
        const clean = codeInputRaw.replace("-", "").trim();

        if (clean.length < 6) {
            errorMessage =
                "Введите полный 6-значный код (например, ABC-123)";
            return;
        }

        isLoading = true;
        errorMessage = "";

        try {
            const [profile] = await Promise.all([
                joinFamily({
                    invite_code: clean,
                }),
                new Promise((resolve) => setTimeout(resolve, 1400)),
            ]);

            successData = profile;
            isSuccess = true;
        } catch {
            errorMessage =
                "Семейный круг с таким кодом не найден.";
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

                <div
                    class="success-avatar"
                    style={`background: ${successData.icon_bg}`}
                >
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

                <span class="success-label">
                    Всё готово
                </span>

                <h1 class="success-title">
                    Вы в семейном круге!
                </h1>

                <p class="success-subtitle">
                    Добро пожаловать в семейный круг
                </p>

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

        <div
            class="loader-container"
            in:fade={{ duration: 220 }}
        >
            <div class="loader-content">
                <div class="loader-avatar">
                    <div class="loader-ring loader-ring-outer"></div>
                    <div class="loader-ring loader-ring-inner"></div>

                    <div class="loader-icon">
                        <Icon
                            icon="material-symbols:family-home-rounded"
                            width="34"
                            height="34"
                        />
                    </div>
                </div>

                <div class="loader-text">
                    <h2>Ищем семейный круг</h2>

                    <p>
                        Проверяем код приглашения...
                    </p>
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
                on:click={() => activeTab.set("onboardingChoose")}
            />

            <div class="header-info">
                <span class="header-step">
                    Присоединение
                </span>

                <h2 class="screen-title">
                    Войти в семейный круг
                </h2>
            </div>
        </header>

        <main class="content">
            <div class="form-header">
                <div class="form-icon">
                    <Icon
                        icon="material-symbols:group-add-rounded"
                        width="24"
                        height="24"
                    />
                </div>

                <div>
                    <h1>Пригласительный код</h1>

                    <p>
                        Введите код, который вам передал
                        член вашей семьи.
                    </p>
                </div>
            </div>

            {#if errorMessage}
                <div
                    class="error-message"
                    transition:slide={{ duration: 180 }}
                >
                    <Icon
                        icon="material-symbols:error-rounded"
                        width="18"
                        height="18"
                    />

                    <span>{errorMessage}</span>
                </div>
            {/if}

            <section class="code-entry-box">
                <label
                    for="invite-code-input"
                    class="code-input-label"
                >
                    Пригласительный код
                </label>

                <input
                    id="invite-code-input"
                    type="text"
                    placeholder="AAA-000"
                    bind:value={codeInputRaw}
                    class="monospaced-code-input"
                    autocomplete="off"
                    autocapitalize="characters"
                    spellcheck="false"
                    inputmode="text"
                    maxlength="7"
                    on:input={handleInput}
                />

                <span class="code-subtext">
                    Три символа, дефис, три символа
                </span>
            </section>

            <div class="hint">
                <div class="hint-icon">
                    <Icon
                        icon="material-symbols:info-rounded"
                        width="16"
                        height="16"
                    />
                </div>

                <span>
                    Код можно получить у владельца или
                    участника семейного круга.
                </span>
            </div>

            <div class="actions">
                <ButtonPrimaryGlow
                    label="Присоединиться"
                    on:click={handleJoinByCode}
                />
            </div>
        </main>
    {/if}
</div>

<style>
    /* ───────────────── Screen ───────────────── */

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

        padding: 8px 10px 0;
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

    /* ───────────────── Form Header ───────────────── */

    .form-header {
        display: flex;
        align-items: center;
        gap: 13px;

        margin-bottom: 20px;
    }

    .form-icon {
        flex: 0 0 46px;

        width: 46px;
        height: 46px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 14px;

        color: var(--accent);

        background: color-mix(
            in srgb,
            var(--accent) 10%,
            var(--surface)
        );

        border: 1px solid color-mix(
            in srgb,
            var(--accent) 12%,
            var(--border)
        );
    }

    .form-header h1 {
        margin: 0 0 4px;

        font-size: 17px;
        line-height: 1.2;
        font-weight: 800;
    }

    .form-header p {
        max-width: 350px;

        margin: 0;

        font-size: 12px;
        line-height: 1.4;

        color: var(--text-secondary);
    }

    /* ───────────────── Error ───────────────── */

    .error-message {
        display: flex;
        align-items: center;
        gap: 8px;

        margin-bottom: 12px;
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

    /* ───────────────── Code ───────────────── */

    .code-entry-box {
        width: 100%;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;
        gap: 8px;

        padding: 16px;

        border-radius: 16px;

        background: var(--surface-alt);
        border: 1px solid var(--border);
    }

    .code-input-label {
        font-size: 11px;
        line-height: 1;

        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;

        color: var(--text-muted);
    }

    .monospaced-code-input {
        width: 100%;

        box-sizing: border-box;

        padding: 14px 12px;

        border: 1.5px solid var(--border);
        border-radius: 12px;

        background: var(--surface);

        color: var(--accent);

        font-family:
            "Courier New",
            Courier,
            monospace;

        font-size: 24px;
        line-height: 1;

        font-weight: 900;

        letter-spacing: 4px;
        text-align: center;
        text-transform: uppercase;

        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
    }

    .monospaced-code-input::placeholder {
        color: var(--text-muted);
        opacity: 0.5;
    }

    .monospaced-code-input:focus {
        outline: none;

        border-color: var(--accent);

        box-shadow:
            0 0 0 3px var(--nav-active-bg);
    }

    .code-subtext {
        font-size: 10px;
        line-height: 1.3;

        color: var(--text-muted);

        text-align: center;
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

        background: color-mix(
            in srgb,
            var(--accent) 9%,
            transparent
        );
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

        border: 2px solid color-mix(
            in srgb,
            var(--accent) 20%,
            transparent
        );

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

        color: var(--accent);

        background: color-mix(
            in srgb,
            var(--accent) 10%,
            var(--surface)
        );
    }

    .loader-text h2 {
        margin: 0 0 7px;

        font-size: 18px;
        line-height: 1.2;
        font-weight: 800;
    }

    .loader-text p {
        margin: 0;

        font-size: 12px;
        line-height: 1.4;

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

        border-radius: inherit;

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

        background: color-mix(
            in srgb,
            var(--accent) 16%,
            transparent
        );

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

        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);

        animation:
            popIn 0.55s
            cubic-bezier(0.175, 0.885, 0.32, 1.275);
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

        box-sizing: border-box;

        border-radius: 50%;

        color: var(--bg);
        background: var(--success);

        border: 3px solid var(--surface);

        animation:
            checkScale 0.35s
            cubic-bezier(0.175, 0.885, 0.32, 1.5)
            0.45s both;
    }

    .success-label {
        display: block;

        margin-bottom: 5px;

        font-size: 10px;
        line-height: 1;

        font-weight: 700;

        letter-spacing: 0.08em;
        text-transform: uppercase;

        color: var(--accent);
    }

    .success-title {
        margin: 0 0 7px;

        font-size: 23px;
        line-height: 1.2;

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
        max-width: 100%;

        margin: 6px 0 25px;

        font-size: 18px;
        line-height: 1.3;

        font-weight: 800;

        color: var(--accent);

        overflow-wrap: anywhere;
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

    /* ───────────────── Small screens ───────────────── */

    @media (max-height: 650px) {
        .content {
            padding-top: 18px;
            padding-bottom: 20px;
        }

        .success-card {
            padding: 28px 20px 24px;
        }

        .success-avatar {
            width: 76px;
            height: 76px;

            margin-bottom: 15px;
        }

        .success-title {
            font-size: 21px;
        }

        .family-name {
            margin-bottom: 20px;
        }
    }

    @media (max-width: 360px) {
        .content {
            padding-left: 16px;
            padding-right: 16px;
        }

        .success-container {
            padding-left: 16px;
            padding-right: 16px;
        }

        .success-card {
            padding-left: 18px;
            padding-right: 18px;
        }

        .monospaced-code-input {
            font-size: 21px;
            letter-spacing: 3px;
        }
    }
</style>
