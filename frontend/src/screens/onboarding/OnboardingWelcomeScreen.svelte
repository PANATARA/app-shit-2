<script lang="ts">
    import { activeTab } from "$lib/navigation";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import { t } from "$lib/i18n";
</script>

<div class="onboarding-screen">
    <div class="first-info">
        <div class="icon-wrap">🏠</div>
        <h2 class="title">{$t.onboarding.familyCircle}</h2>
        <p class="subtitle">
            {$t.onboarding.welcomeSubtitle}
        </p>
        <div class="pills">
            <div class="pill"><span>👥</span> {$t.onboarding.upTo10}</div>
            <div class="pill"><span>🛡️</span> {$t.onboarding.onlyFamily}</div>
            <div class="pill"><span>🔄</span> {$t.onboarding.sync}</div>
        </div>
        <ButtonPrimaryGlow
            label={$t.onboarding.continue}
            on:click={() => activeTab.set("onboardingProfile")}
        />
    </div>
</div>

<style>
    .onboarding-screen {
        width: 100%;
        height: 100dvh;
        max-height: 100dvh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: transparent;
        padding: max(20px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom));
    }
    .first-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 24px 0;
        margin-bottom: 24px;
    }

    .icon-wrap {
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background: rgba(210, 140, 90, 0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        margin-bottom: 16px;
    }

    .title {
        font-size: 24px;
        font-weight: 800;
        color: var(--text-primary);
        text-align: center;
        margin: 0 0 6px;
        letter-spacing: -0.5px;
    }

    .subtitle {
        font-size: 14px;
        color: var(--text-secondary);
        text-align: center;
        margin: 0 0 20px;
        line-height: 1.5;
    }

    .pills {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 24px;
    }

    .pill {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.07);
        border: 0.5px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 6px 14px;
        font-size: 12px;
        color: var(--text-secondary);
    }
</style>
