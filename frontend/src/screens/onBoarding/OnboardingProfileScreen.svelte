<script lang="ts">
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import { activeTab } from "$lib/navigation";
    import { getProfile, updateProfile } from "$api/me";
    import { getCached, setCached } from "$lib/cache";
    import { t } from "$lib/i18n";

    import AvatarBuilder from "$features/settings/AvatarBuilder.svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import Icon from "@iconify/svelte";

    let name = "";
    let avatar = {
        icon: "material-symbols:person-rounded",
        icon_color: "#ffffff",
        icon_bg: "linear-gradient(135deg, #F97316 0%, #FB7185 100%)",
    };

    let isLoading = false;
    let errorMessage = "";

    onMount(async () => {
        try {
            const cached = getCached<any>("profile");
            const profile = cached || (await getProfile());
            if (profile) {
                if (profile.name) name = profile.name;
                if (profile.icon) avatar.icon = profile.icon;
                if (profile.icon_color) avatar.icon_color = profile.icon_color;
                if (profile.icon_bg) avatar.icon_bg = profile.icon_bg;
            }
        } catch (e) {
            // Profile fallback
        }
    });

    async function handleSaveProfile() {
        if (!name.trim()) {
            errorMessage = $t.onboarding.nameRequiredError || "Пожалуйста, введите ваше имя";
            return;
        }

        isLoading = true;
        errorMessage = "";

        try {
            const updated = await updateProfile({
                name: name.trim(),
                icon: avatar.icon,
                icon_color: avatar.icon_color,
                icon_bg: avatar.icon_bg,
            });

            if (updated) {
                setCached("profile", updated);
            }

            activeTab.set("onboardingChoose");
        } catch (e: any) {
            errorMessage = e?.message || $t.onboarding.saveProfileError || "Не удалось сохранить профиль";
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="onboarding-screen">
    <main class="content">
        <!-- Header -->
        <header class="intro">
            <span class="step-badge">{$t.onboarding.profileBadge || "Ваш профиль"}</span>
            <h1 class="title">{$t.onboarding.profileTitle || "Давайте знакомиться"}</h1>
            <p class="subtitle">
                {$t.onboarding.profileSubtitle || "Укажите имя и выберите аватарку, чтобы семья сразу узнала вас."}
            </p>
        </header>

        <!-- Name Input -->
        <section class="form-section">
            <div class="input-group">
                <label class="field-label" for="profile-first-name">
                    {$t.onboarding.firstName || "Имя"} <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                    <span class="input-icon">👤</span>
                    <input
                        id="profile-first-name"
                        class="field-input"
                        type="text"
                        placeholder={$t.onboarding.firstNamePlaceholder || "Ваше имя (например, Анна)"}
                        bind:value={name}
                        on:input={() => { if (errorMessage) errorMessage = ""; }}
                        maxlength={50}
                        autocomplete="given-name"
                    />
                </div>
            </div>
        </section>

        <!-- Avatar Builder -->
        <section class="avatar-section">
            <div class="section-head">
                <h2 class="section-title">{$t.onboarding.avatarTitle || "Ваш аватар"}</h2>
                <span class="section-hint">{$t.onboarding.avatarHint || "Выберите иконку и цвет фона"}</span>
            </div>

            <div class="avatar-builder-card">
                <AvatarBuilder
                    initialIcon={avatar.icon}
                    initialIconColor={avatar.icon_color}
                    initialBg={avatar.icon_bg}
                    allowIcon={true}
                    allowIconColor={false}
                    allowBg={true}
                    iconCategories={["people", "pets", "nature", "misc"]}
                    onchange={(v) => {
                        avatar = v;
                    }}
                />
            </div>
        </section>

        {#if errorMessage}
            <div class="error-message" transition:slide={{ duration: 180 }}>
                <Icon icon="material-symbols:error-rounded" width="20" height="20" />
                <span>{errorMessage}</span>
            </div>
        {/if}

        <!-- Actions -->
        <div class="actions">
            <ButtonPrimaryGlow
                label={isLoading ? "Сохранение..." : ($t.onboarding.continueBtn || "Продолжить")}
                on:click={handleSaveProfile}
                disabled={isLoading}
            />
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

    .content {
        width: 100%;
        max-width: 460px;
        box-sizing: border-box;
        margin: 0 auto;
        padding: max(16px, env(safe-area-inset-top)) 18px max(24px, env(safe-area-inset-bottom));

        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    /* ── Header ── */
    .intro {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding-top: 6px;
    }

    .step-badge {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent);
        background: var(--accent-soft);
        padding: 4px 12px;
        border-radius: var(--radius-pill, 999px);
        margin-bottom: 12px;
    }

    .title {
        margin: 0 0 8px;
        font-size: 26px;
        line-height: 1.15;
        font-weight: 800;
        letter-spacing: -0.6px;
        color: var(--text-primary);
    }

    .subtitle {
        margin: 0;
        font-size: 14px;
        line-height: 1.45;
        color: var(--text-secondary);
        max-width: 360px;
    }

    /* ── Form ── */
    .form-section {
        display: flex;
        flex-direction: column;
        gap: 14px;
        background: var(--surface);
        padding: 16px;
        border-radius: var(--radius-card, 20px);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .field-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.2px;
    }

    .required {
        color: var(--accent);
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
        padding: 13px 14px 13px 44px;
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

    /* ── Avatar Section ── */
    .avatar-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .section-head {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 0 4px;
    }

    .section-title {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.2px;
    }

    .section-hint {
        font-size: 12px;
        color: var(--text-muted);
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
        gap: 10px;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #ef4444;
        font-size: 13px;
        font-weight: 600;
    }

    /* ── Actions ── */
    .actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 4px;
    }
</style>
