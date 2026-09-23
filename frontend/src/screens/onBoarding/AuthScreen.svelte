<script lang="ts">
    import { onMount, tick } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";
    import Icon from "@iconify/svelte";
    import AvatarBuilder from "$features/settings/AvatarBuilder.svelte";
    import { login, register, debugAuth, loginWithGoogle } from "$api/auth";
    import { renderGoogleButton, promptGoogleOneTap } from "$lib/googleAuth";
    import { t } from "$lib/i18n";

    const dispatch = createEventDispatcher();

    type Mode = "login" | "register";

    let mode: Mode = "login";
    let username = "";
    let password = "";
    let name = "";
    let loading = false;
    let error = "";
    let googleBtnContainer: HTMLElement | null = null;

    let avatar = {
        icon: "material-symbols:person-rounded",
        icon_color: "#ffffff",
        icon_bg: "linear-gradient(135deg, #F97316 0%, #FB7185 100%)",
    };
    let showAvatarPicker = false;

    async function setupGoogleButton() {
        await tick();
        if (googleBtnContainer) {
            try {
                await renderGoogleButton(
                    googleBtnContainer,
                    handleGoogleCredential,
                );
                promptGoogleOneTap();
            } catch (err) {
                console.warn("Could not render Google Sign-In button:", err);
            }
        }
    }

    onMount(() => {
        setupGoogleButton();
    });

    $: if (mode) {
        setupGoogleButton();
    }

    async function handleGoogleCredential(credential: string) {
        if (!credential) return;
        error = "";
        loading = true;
        try {
            await loginWithGoogle(credential);
            dispatch("auth");
        } catch (e: any) {
            error = e?.data?.detail ?? e?.message ?? $t.auth.googleAuthError;
        } finally {
            loading = false;
        }
    }

    async function handleLogin() {
        if (!username.trim()) {
            error = $t.auth.enterUsername;
            return;
        }
        if (!password) {
            error = $t.auth.enterPassword;
            return;
        }
        error = "";
        loading = true;
        try {
            await login(username.trim(), password);
            dispatch("auth");
        } catch (e: any) {
            error = e?.data?.detail ?? e?.message ?? $t.auth.authError;
        } finally {
            loading = false;
        }
    }

    async function handleRegister() {
        if (!username.trim()) {
            error = $t.auth.enterUsername;
            return;
        }
        if (!password || password.length < 6) {
            error = $t.auth.passwordMinLength;
            return;
        }
        error = "";
        loading = true;
        try {
            await register(
                username.trim(),
                password,
                name.trim() || null,
                avatar,
            );
            dispatch("auth");
        } catch (e: any) {
            error = e?.data?.detail ?? e?.message ?? $t.auth.authError;
        } finally {
            loading = false;
        }
    }

    async function handleDebugAuth() {
        const debugUser = username.trim() || "debug_user";
        error = "";
        loading = true;
        try {
            await debugAuth(debugUser);
            dispatch("auth");
        } catch (e: any) {
            error = e?.data?.detail ?? e?.message ?? $t.auth.authError;
        } finally {
            loading = false;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            mode === "login" ? handleLogin() : handleRegister();
        }
    }
</script>

<div class="page">
    <div class="card">
        <div class="logo">🏠</div>

        {#if mode === "login"}
            <h1 class="title">{$t.auth.loginTitle}</h1>
            <p class="subtitle">{$t.auth.loginSubtitle}</p>

            <div class="field">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="field-label">{$t.auth.usernameLabel}</label>
                <input
                    class="field-input"
                    type="text"
                    placeholder={$t.auth.usernamePlaceholder}
                    bind:value={username}
                    on:keydown={handleKeydown}
                    autocomplete="username"
                    maxlength="60"
                    disabled={loading}
                />
            </div>

            <div class="field">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="field-label">{$t.auth.passwordLabel}</label>
                <input
                    class="field-input"
                    type="password"
                    placeholder={$t.auth.passwordPlaceholder}
                    bind:value={password}
                    on:keydown={handleKeydown}
                    autocomplete="current-password"
                    maxlength="100"
                    disabled={loading}
                />
            </div>

            {#if error}
                <p class="error">{error}</p>
            {/if}

            <button
                class="btn-primary"
                on:click={handleLogin}
                disabled={loading}
            >
                {loading ? $t.auth.loggingIn : $t.auth.signIn}
            </button>

            <button
                class="btn-link"
                type="button"
                on:click={() => {
                    mode = "register";
                    error = "";
                }}
                disabled={loading}
            >
                {$t.auth.noAccount}
            </button>
        {:else}
            <h1 class="title">{$t.auth.registerTitle}</h1>
            <p class="subtitle">{$t.auth.registerSubtitle}</p>

            <div class="field">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="field-label"
                    >{$t.auth.usernameLabel}
                    <span class="required">*</span></label
                >
                <input
                    class="field-input"
                    type="text"
                    placeholder={$t.auth.usernamePlaceholder}
                    bind:value={username}
                    on:keydown={handleKeydown}
                    autocomplete="username"
                    maxlength="60"
                    disabled={loading}
                />
            </div>

            <div class="field">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="field-label">{$t.auth.nameLabel}</label>
                <input
                    class="field-input"
                    type="text"
                    placeholder={$t.auth.namePlaceholder}
                    bind:value={name}
                    on:keydown={handleKeydown}
                    autocomplete="given-name"
                    maxlength="50"
                    disabled={loading}
                />
            </div>

            <div class="field">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="field-label">{$t.auth.avatarOptional}</label>
                <div class="avatar-selector-row">
                    <div
                        class="reg-avatar-preview"
                        style="background: {avatar.icon_bg}"
                    >
                        <Icon
                            icon={avatar.icon}
                            width={26}
                            height={26}
                            color={avatar.icon_color}
                        />
                    </div>
                    <button
                        type="button"
                        class="btn-choose-avatar"
                        on:click={() => (showAvatarPicker = !showAvatarPicker)}
                        disabled={loading}
                    >
                        <Icon
                            icon="material-symbols:palette-outline"
                            width={18}
                            height={18}
                        />
                        <span
                            >{showAvatarPicker
                                ? $t.common.close
                                : $t.auth.chooseAvatar}</span
                        >
                    </button>
                </div>
                {#if showAvatarPicker}
                    <div
                        class="reg-avatar-builder"
                        transition:slide={{ duration: 180 }}
                    >
                        <AvatarBuilder
                            initialIcon={avatar.icon}
                            initialIconColor={avatar.icon_color}
                            initialBg={avatar.icon_bg}
                            allowIcon={true}
                            allowIconColor={false}
                            allowBg={true}
                            iconCategories={[
                                "people",
                                "pets",
                                "nature",
                                "misc",
                            ]}
                            onchange={(v) => {
                                avatar = v;
                            }}
                        />
                    </div>
                {/if}
            </div>

            <div class="field">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="field-label"
                    >{$t.auth.passwordLabel}
                    <span class="required">*</span></label
                >
                <input
                    class="field-input"
                    type="password"
                    placeholder={$t.auth.passwordPlaceholder}
                    bind:value={password}
                    on:keydown={handleKeydown}
                    autocomplete="new-password"
                    maxlength="100"
                    disabled={loading}
                />
            </div>

            {#if error}
                <p class="error">{error}</p>
            {/if}

            <button
                class="btn-primary"
                on:click={handleRegister}
                disabled={loading}
            >
                {loading ? $t.auth.registering : $t.auth.signUp}
            </button>

            <button
                class="btn-link"
                type="button"
                on:click={() => {
                    mode = "login";
                    error = "";
                }}
                disabled={loading}
            >
                {$t.auth.haveAccount}
            </button>
        {/if}

        <div class="or-divider">
            <span>{$t.auth.orDivider}</span>
        </div>

        <div class="google-btn-wrapper">
            <div
                class="google-btn-container"
                bind:this={googleBtnContainer}
            ></div>
        </div>
    </div>
</div>

<style>
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    .page {
        height: 100dvh;
        max-height: 100dvh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: max(24px, env(safe-area-inset-top)) 16px
            max(24px, env(safe-area-inset-bottom));
        background: var(--bg);
        font-family: inherit;
    }

    .card {
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .logo {
        font-size: 48px;
        text-align: center;
        margin-bottom: 2px;
    }

    .title {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
    }

    .subtitle {
        font-size: 13px;
        color: var(--text-muted);
        text-align: center;
        line-height: 1.4;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-top: 2px;
    }

    .field-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .field-input {
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px 16px;
        color: var(--text-primary);
        font-size: 15px;
        font-family: inherit;
        outline: none;
        width: 100%;
        transition: border-color 0.15s;
    }

    .field-input:focus {
        border-color: var(--accent);
    }
    .field-input:disabled {
        opacity: 0.5;
    }

    .error {
        font-size: 13px;
        color: #ff3b30;
        text-align: center;
    }

    .btn-primary {
        width: 100%;
        padding: 14px;
        background: var(--accent);
        border: none;
        border-radius: 14px;
        color: #fff;
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: opacity 0.15s;
        margin-top: 2px;
    }

    .btn-primary:active {
        opacity: 0.8;
    }
    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-link {
        background: none;
        border: none;
        color: var(--accent);
        font-size: 13px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        padding: 4px 0;
        text-align: center;
        transition: opacity 0.15s;
    }

    .btn-link:active {
        opacity: 0.6;
    }
    .btn-link:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .or-divider {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0 4px 0;
    }

    .or-divider::before,
    .or-divider::after {
        content: "";
        flex: 1;
        height: 0.5px;
        background: var(--border);
    }

    .or-divider span {
        font-size: 11px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
    }

    .google-btn-wrapper {
        display: flex;
        justify-content: center;
        width: 100%;
        min-height: 44px;
    }

    .google-btn-container {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .avatar-selector-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .reg-avatar-preview {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    .btn-choose-avatar {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 14px;
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 12px;
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .btn-choose-avatar:hover {
        border-color: var(--accent);
    }

    .reg-avatar-builder {
        margin-top: 10px;
        padding: 12px;
        background: var(--surface-alt);
        border-radius: 16px;
        border: 1px solid var(--border);
    }

    .btn-debug:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
</style>
