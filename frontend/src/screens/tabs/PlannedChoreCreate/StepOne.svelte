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
        createPlannedChoreParams.set({
            chore,
        });
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

        <h1>
            {"Запланировать задачу"}
        </h1>

        <div class="header-spacer"></div>
    </header>

    <SearchBox bind:searchQuery />

    {#if loading}
        <CardPlannedChoreSkeleton count={3} />
    {:else}
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
                    <ChoreListItem
                        {chore}
                        on:click={() => selectChore(chore)}
                    />
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
    /* ── STEP 1 ───────────────────────────────────── */
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

    .chore-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 16px;
    }
</style>
