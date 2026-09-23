<script lang="ts">
    import { activeTab } from "$lib/navigation";
    import BackButton from "$ui/backbtn.svelte";
    import Icon from "@iconify/svelte";
    import { t } from "$lib/i18n";

    function choose(type: "create" | "join") {
        activeTab.set(
            type === "create" ? "onboardingCreateStep1" : "onboardingJoin",
        );
    }

    function handleBack() {
        activeTab.set("onboardingProfile");
    }
</script>

<div class="onboarding-screen">
    <!-- Header -->
    <header class="onboarding-header">
        <BackButton on:click={handleBack} />
        <div class="header-info">
            <span class="header-step">{$t.onboarding.familyCircle || "Семейный круг"}</span>
            <h2 class="screen-title">{$t.onboarding.chooseTitle || "Как начнём?"}</h2>
        </div>
    </header>

    <main class="content">
        <section class="intro">
            <div class="intro-icon">
                <Icon
                    icon="material-symbols:family-home-rounded"
                    width="36"
                    height="36"
                />
            </div>

            <div class="intro-text">
                <h1>{$t.onboarding.chooseTitle}</h1>
                <p>{$t.onboarding.chooseSubtitle}</p>
            </div>
        </section>

        <section class="choose-options">
            <button
                class="choose-card create"
                type="button"
                on:click={() => choose("create")}
            >
                <div class="card-top">
                    <div class="choose-icon create-icon">
                        <Icon
                            icon="material-symbols:add-home-rounded"
                            width="28"
                            height="28"
                        />
                    </div>
                    <span class="choose-label">{$t.onboarding.newFamily}</span>
                </div>

                <div class="choose-content">
                    <strong class="card-title">{$t.onboarding.createFamily}</strong>
                    <p class="card-desc">{$t.onboarding.createFamilyDesc}</p>
                </div>

                <div class="card-footer">
                    <span class="action-text">{$t.onboarding.startCreating || "Начать создание"}</span>
                    <Icon
                        icon="material-symbols:arrow-forward-rounded"
                        width="18"
                        height="18"
                    />
                </div>
            </button>

            <button
                class="choose-card join"
                type="button"
                on:click={() => choose("join")}
            >
                <div class="card-top">
                    <div class="choose-icon join-icon">
                        <Icon
                            icon="material-symbols:handshake-rounded"
                            width="28"
                            height="28"
                        />
                    </div>
                    <span class="choose-label">{$t.onboarding.alreadyHaveFamily}</span>
                </div>

                <div class="choose-content">
                    <strong class="card-title">{$t.onboarding.joinFamily}</strong>
                    <p class="card-desc">{$t.onboarding.joinFamilyDesc}</p>
                </div>

                <div class="card-footer">
                    <span class="action-text">{$t.onboarding.enterCode || "Ввести код"}</span>
                    <Icon
                        icon="material-symbols:arrow-forward-rounded"
                        width="18"
                        height="18"
                    />
                </div>
            </button>
        </section>

        <div class="bottom-hint">
            <Icon
                icon="material-symbols:lock-outline-rounded"
                width="16"
                height="16"
            />
            <span>{$t.onboarding.privateHint}</span>
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

    /* ── Choose Options ── */
    .choose-options {
        display: flex;
        flex-direction: column;
        gap: 14px;
        width: 100%;
    }

    .choose-card {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 18px;
        border-radius: var(--radius-card, 22px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
        cursor: pointer;
        text-align: left;
        font-family: inherit;
        transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, box-shadow 0.2s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .choose-card:active {
        transform: scale(0.98);
        border-color: var(--accent);
    }

    .choose-card.create {
        border-color: color-mix(in srgb, var(--accent) 28%, var(--border-subtle));
    }

    .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .choose-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .create-icon {
        background: var(--accent-soft);
        color: var(--accent);
    }

    .join-icon {
        background: color-mix(in srgb, var(--success) 14%, transparent);
        color: var(--success);
    }

    .choose-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--text-muted);
        background: var(--surface-alt);
        padding: 4px 10px;
        border-radius: var(--radius-pill, 999px);
    }

    .choose-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .card-title {
        font-size: 18px;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.3px;
    }

    .card-desc {
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
        color: var(--text-secondary);
    }

    .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 10px;
        border-top: 1px solid var(--border-subtle);
        color: var(--accent);
        font-size: 13px;
        font-weight: 700;
    }

    /* ── Bottom Hint ── */
    .bottom-hint {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--text-muted);
        font-size: 12px;
        text-align: center;
        margin-top: auto;
        padding: 8px 0;
    }
</style>
