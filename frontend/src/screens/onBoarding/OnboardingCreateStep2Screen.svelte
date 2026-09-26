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

    import { getDefaultChores, addChoresFromDefault as createChoresFromDefault } from "$lib/choresStore";
    import ChoreSelectionSkeleton from "$skeletons/ChoreSelectionSkeleton.svelte";
    import { language } from "$lib/settings";

    export let onSuccess: (family: FamilyProfile) => void;

    let isLoading = false;
    let isSuccess = false;
    let successData: FamilyProfile | null = null;
    let errorMessage = "";

    // Default chores onboarding selection
    let defaultChores: any[] = [];
    let loadingDefaultChores = false;
    let selectedChoreIds = new Set<string>();
    let isAddingChores = false;

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

    async function loadDefaultChores() {
        loadingDefaultChores = true;
        try {
            const chores = await getDefaultChores();
            if (Array.isArray(chores) && chores.length > 0) {
                defaultChores = chores;
                // Preselect first 4 chores for a quick pleasant start
                selectedChoreIds = new Set(chores.slice(0, 4).map((c: any) => String(c.id)));
            }
        } catch (e) {
            console.warn("Could not load default chores:", e);
        } finally {
            loadingDefaultChores = false;
        }
    }

    function toggleChoreSelection(choreId: string) {
        const strId = String(choreId);
        if (selectedChoreIds.has(strId)) {
            selectedChoreIds.delete(strId);
        } else {
            selectedChoreIds.add(strId);
        }
        selectedChoreIds = new Set(selectedChoreIds);
    }

    function toggleSelectAll() {
        if (selectedChoreIds.size === defaultChores.length) {
            selectedChoreIds = new Set();
        } else {
            selectedChoreIds = new Set(defaultChores.map((c: any) => String(c.id)));
        }
    }

    async function handleAddChoresAndEnter() {
        if (selectedChoreIds.size > 0) {
            isAddingChores = true;
            try {
                await createChoresFromDefault({
                    default_chore_ids: Array.from(selectedChoreIds),
                    language: $language || "ru",
                });
            } catch (e) {
                console.error("Failed to add default chores:", e);
            } finally {
                isAddingChores = false;
            }
        }
        if (successData) {
            onSuccess(successData);
        }
    }

    function handleSkipAndEnter() {
        if (successData) {
            onSuccess(successData);
        }
    }

    async function handleFinishCreate() {
        isLoading = true;
        errorMessage = "";

        try {
            const [profile] = await Promise.all([
                createFamily($onboardingParams.familyForm),
                new Promise((resolve) => setTimeout(resolve, 800)),
            ]);

            successData = profile;
            isSuccess = true;
            loadDefaultChores();
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
        <!-- SUCCESS & INITIAL CHORES (FULLSCREEN EXPANDED) -->
        <div class="initial-chores-screen" in:fade={{ duration: 250 }}>
            <header class="chores-header">
                <div class="family-success-badge">
                    <div class="family-mini-avatar" style="background: {successData.icon_bg}">
                        <Icon
                            icon={successData.icon}
                            width="20"
                            height="20"
                            color={successData.icon_color}
                        />
                    </div>
                    <div class="family-badge-text">
                        <span class="family-badge-name">«{successData.name}»</span>
                        <span class="family-badge-sub">
                            <Icon icon="material-symbols:check-circle-rounded" width="13" height="13" />
                            {$t.onboarding.familyCreatedTitle || "Семья создана!"}
                        </span>
                    </div>
                </div>

                <div class="chores-title-block">
                    <h1 class="chores-heading">{$t.onboarding.addInitialChoresTitle || "Добавьте первые задачи"}</h1>
                    <p class="chores-subheading">{$t.onboarding.addInitialChoresSubtitle || "Выберите типовые домашние дела, чтобы сразу начать пользоваться"}</p>
                </div>

                {#if !loadingDefaultChores && defaultChores.length > 0}
                    <div class="chores-toolbar">
                        <span class="toolbar-count">
                            {$t.onboarding.selectedCount
                                ? $t.onboarding.selectedCount.replace('{selected}', String(selectedChoreIds.size)).replace('{total}', String(defaultChores.length))
                                : `Выбрано: ${selectedChoreIds.size} из ${defaultChores.length}`}
                        </span>
                        <button type="button" class="toolbar-toggle-btn" on:click={toggleSelectAll}>
                            {selectedChoreIds.size === defaultChores.length
                                ? ($t.onboarding.deselectAll || "Снять все")
                                : ($t.onboarding.selectAll || "Выбрать все")}
                        </button>
                    </div>
                {/if}
            </header>

            <main class="chores-scroll-area">
                {#if loadingDefaultChores}
                    <ChoreSelectionSkeleton count={5} />
                {:else if defaultChores.length > 0}
                    <div class="chores-selection-list">
                        {#each defaultChores as chore (chore.id)}
                            {@const isSelected = selectedChoreIds.has(String(chore.id))}
                            <button
                                type="button"
                                class="chore-select-item"
                                class:selected={isSelected}
                                on:click={() => toggleChoreSelection(chore.id)}
                            >
                                <div
                                    class="chore-icon-pill"
                                    style="background: {chore.icon_bg || 'var(--surface-alt)'}; color: {chore.icon_color || 'var(--text-primary)'}"
                                >
                                    <Icon icon={chore.icon || "material-symbols:task-alt-rounded"} width={22} height={22} />
                                </div>
                                <div class="chore-select-info">
                                    <span class="chore-title">{chore.name}</span>
                                    {#if chore.description}
                                        <span class="chore-desc">{chore.description}</span>
                                    {/if}
                                    {#if chore.valuation}
                                        <span class="chore-xp">+{chore.valuation} XP</span>
                                    {/if}
                                </div>
                                <div class="checkbox-circle" class:checked={isSelected}>
                                    {#if isSelected}
                                        <Icon icon="material-symbols:check-rounded" width={15} height={15} />
                                    {/if}
                                </div>
                            </button>
                        {/each}
                    </div>
                {/if}
            </main>

            <footer class="chores-bottom-actions">
                <ButtonPrimaryGlow
                    label={isAddingChores
                        ? ($t.onboarding.addingChores || "Добавление задач...")
                        : (selectedChoreIds.size > 0
                            ? ($t.onboarding.addSelectedChores ? $t.onboarding.addSelectedChores.replace('{count}', String(selectedChoreIds.size)) : `Добавить задачи (${selectedChoreIds.size}) и войти`)
                            : ($t.onboarding.enterFamily || "Войти в семейный круг"))}
                    on:click={handleAddChoresAndEnter}
                    disabled={isAddingChores}
                />
                {#if defaultChores.length > 0}
                    <button
                        type="button"
                        class="skip-btn"
                        on:click={handleSkipAndEnter}
                        disabled={isAddingChores}
                    >
                        {$t.onboarding.skipChores || "Пропустить и войти"}
                    </button>
                {/if}
            </footer>
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

    /* ── Initial Chores Screen (Full-Screen) ── */
    .initial-chores-screen {
        width: 100%;
        height: 100%;
        max-width: 520px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        box-sizing: border-box;
    }

    .chores-header {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: max(14px, env(safe-area-inset-top)) 18px 10px;
        flex-shrink: 0;
    }

    .family-success-badge {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        align-self: flex-start;
        padding: 5px 12px 5px 5px;
        border-radius: var(--radius-pill, 999px);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .family-mini-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .family-badge-text {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
    }

    .family-badge-name {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .family-badge-sub {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        font-weight: 600;
        color: var(--success, #22c55e);
    }

    .chores-title-block {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .chores-heading {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: -0.4px;
        color: var(--text-primary);
    }

    .chores-subheading {
        margin: 0;
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.35;
    }

    .chores-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 2px;
    }

    .toolbar-count {
        font-size: 12px;
        font-weight: 700;
        color: var(--accent);
    }

    .toolbar-toggle-btn {
        background: none;
        border: none;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.15s ease;
    }

    .toolbar-toggle-btn:hover {
        color: var(--accent);
        background: var(--surface-alt);
    }

    /* ── Chores Scroll Area ── */
    .chores-scroll-area {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 4px 18px 16px;
        display: flex;
        flex-direction: column;
    }

    .chores-selection-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
        width: 100%;
        padding-bottom: 8px;
    }

    .chore-select-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 18px;
        background: var(--surface);
        border: 1.5px solid var(--border-subtle);
        cursor: pointer;
        transition: all 0.16s ease;
        text-align: left;
        width: 100%;
        box-sizing: border-box;
    }

    .chore-select-item:active {
        transform: scale(0.99);
    }

    .chore-select-item.selected {
        background: var(--surface);
        border-color: var(--accent);
        box-shadow: 0 3px 12px var(--accent-glow, rgba(232, 106, 71, 0.14));
    }

    .chore-icon-pill {
        width: 42px;
        height: 42px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .chore-select-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .chore-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .chore-desc {
        font-size: 11px;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .chore-xp {
        font-size: 11px;
        font-weight: 700;
        color: var(--accent);
    }

    .checkbox-circle {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: #fff;
        transition: all 0.15s ease;
        background: var(--surface-alt);
    }

    .checkbox-circle.checked {
        background: var(--accent);
        border-color: var(--accent);
    }

    /* ── Bottom Actions ── */
    .chores-bottom-actions {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 18px max(18px, env(safe-area-inset-bottom));
        background: var(--surface);
        border-top: 1px solid var(--border-subtle);
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
    }

    .skip-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        padding: 6px 12px;
        transition: color 0.15s ease;
        align-self: center;
    }

    .skip-btn:hover {
        color: var(--text-primary);
    }

    /* ── Loading State ── */
    .state-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 20px;
    }

    .loader-card {
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
