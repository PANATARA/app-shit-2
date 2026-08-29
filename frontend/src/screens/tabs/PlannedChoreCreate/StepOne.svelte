<script lang="ts">
    import { getChores } from "$api/chores";
    import { getFamilyMembers } from "$api/family";
    import type { ChoreItem } from "$types/index";
    import SearchBox from "$ui/SearchBox.svelte";
    import ChoreListItem from "$features/chores/ChoreListItem.svelte";
    import Backbtn from "$ui/backbtn.svelte";
    import { swr } from "$lib/swr";
    import { createPlannedChoreParams, activeTab } from "$lib/navigation";
    import CardPlannedChoreSkeleton from "$skeletons/CardPlannedChoreSkeleton.svelte";

    // ─── State ───────────────────────────────────────────────────────────────

    let searchQuery = "";

    // ─── Data fetching ───────────────────────────────────────────────────────

    const choresData = swr("chores", getChores);
    const members = swr("family-members", getFamilyMembers);

    $: chores = $choresData.data?.chores ?? [];

    $: loading = $choresData.loading || $members.loading;
    $: error = $choresData.error || $members.error;

    // ─── Navigation ──────────────────────────────────────────────────────────

    function handleBack() {
        activeTab.set("boardScreen");
    }

    function selectChore(chore: ChoreItem) {
        createPlannedChoreParams.set({ chore, isQuickTask: false });
        activeTab.set("createPlannedChoreStepTwo");
    }

    function selectQuickTask() {
        createPlannedChoreParams.set({ chore: null, isQuickTask: true });
        activeTab.set("createPlannedChoreStepTwo");
    }

    // ─── Search & filtering ───────────────────────────────────────────────────
    $: normalizedQuery = searchQuery.trim().toLowerCase();

    $: filteredChores = normalizedQuery
        ? chores.filter((c) => c.name.toLowerCase().includes(normalizedQuery))
        : chores;

    $: hasExactMatch = filteredChores.some(
        (c) => c.name.toLowerCase() === normalizedQuery,
    );

    $: showCreateNew = normalizedQuery.length > 0 && !hasExactMatch;
</script>

<div class="page">
    <header class="page-header">
        <Backbtn label="Назад" on:click={handleBack} />
        <h1>Запланировать задачу</h1>
        <div class="header-spacer"></div>
    </header>

    <SearchBox bind:searchQuery />

    {#if loading}
        <CardPlannedChoreSkeleton count={3} />
    {:else}
        <!-- Быстрая задача — показываем только если нет поискового запроса -->
        {#if !normalizedQuery}
            <div class="section">
                <button class="quick-task-item" on:click={selectQuickTask}>
                    <div class="quick-task-icon">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </div>
                    <div class="quick-task-info">
                        <span class="quick-task-name">Быстрая задача</span>
                        <span class="quick-task-desc"
                            >Без категории и шаблона</span
                        >
                    </div>
                    <svg
                        class="chore-arrow"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            <div class="divider">
                <span class="divider-label">или выберите из шаблонов</span>
            </div>
        {/if}

        {#if showCreateNew}
            <button
                class="create-new-item"
                on:click={() => selectChore(searchQuery.trim())}
            >
                <span class="create-new-icon">+</span>
                <span>Создать «{searchQuery.trim()}»</span>
            </button>
        {/if}

        {#if filteredChores.length > 0}
            <div class="chore-list">
                {#each filteredChores as chore (chore.id)}
                    <ChoreListItem {chore} onClick={selectChore} />
                {/each}
            </div>
        {:else if !showCreateNew}
            <div class="state-msg">
                <p class="state-text">Ничего не найдено</p>
            </div>
        {/if}
    {/if}
</div>

<style>
    .page {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        background: var(--bg);
        padding-top: env(safe-area-inset-top);
    }

    .page-header {
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0px;
        flex-shrink: 0;
    }

    .page-header h1 {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        white-space: nowrap;
    }

    .header-spacer {
        width: 80px;
    }

    /* ── Быстрая задача ───────────────────────────────── */

    .section {
        padding: 0 16px;
        margin-bottom: 4px;
    }

    .quick-task-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 14px;
        background: var(--bg-card);
        border: none;
        border-radius: 14px;
        color: var(--text-primary);
        font-size: 15px;
        font-family: inherit;
        cursor: pointer;
        text-align: left;
        transition: opacity 0.1s;
    }

    .quick-task-item:active {
        opacity: 0.7;
    }

    .quick-task-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--accent) 14%, var(--surface));
        color: var(--accent);
        flex-shrink: 0;
    }

    .quick-task-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .quick-task-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .quick-task-desc {
        font-size: 12px;
        color: var(--text-muted);
    }

    /* ── Разделитель ──────────────────────────────────── */

    .divider {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
    }

    .divider::before,
    .divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--border, rgba(0, 0, 0, 0.08));
    }

    .divider-label {
        font-size: 12px;
        color: var(--text-muted);
        white-space: nowrap;
        flex-shrink: 0;
    }

    /* ── Создать новую ────────────────────────────────── */

    .create-new-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: calc(100% - 32px);
        margin: 0 16px 14px;
        padding: 14px 16px;
        border: none;
        border-radius: 20px;
        background: linear-gradient(
            160deg,
            color-mix(in srgb, var(--accent) 14%, var(--surface)),
            var(--surface)
        );
        color: var(--accent);
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        text-align: left;
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 8px 24px rgba(0, 0, 0, 0.06);
        transition:
            transform 0.15s ease,
            opacity 0.15s ease;
    }

    .create-new-item:active {
        transform: scale(0.97);
        opacity: 0.8;
    }

    .create-new-icon {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--accent) 16%, transparent);
        font-size: 22px;
        flex-shrink: 0;
    }

    /* ── Список шаблонов ──────────────────────────────── */

    .chore-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 16px;
    }

    .state-msg {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 16px;
    }

    .state-text {
        font-size: 14px;
        color: var(--text-muted);
    }
</style>
