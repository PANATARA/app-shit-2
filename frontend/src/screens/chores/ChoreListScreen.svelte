<script lang="ts">
    import { activeTab, choreEditParams } from "$lib/navigation";
    import { useFamilyChores } from "$lib/choresStore";
    import type { ChoreItem } from "$types/index";
    import Icon from "@iconify/svelte";
    import SearchBox from "$ui/SearchBox.svelte";
    import ChoreListItem from "$features/chores/ChoreListItem.svelte";
    import ChoreListSkeleton from "$skeletons/ChoreListSkeleton.svelte";
    import { t } from "$lib/i18n";

    const choreStore = useFamilyChores();

    $: chores = $choreStore.data?.chores ?? [];
    $: loading = $choreStore.loading;

    let searchQuery = "";

    $: normalizedQuery = searchQuery.trim().toLowerCase();
    $: filteredChores = normalizedQuery
        ? chores.filter((c) => c.name.toLowerCase().includes(normalizedQuery))
        : chores;

    function openDetail(chore: ChoreItem) {
        choreEditParams.set({ chore });
        activeTab.set("choreEditScreen");
    }
</script>

<div class="page">
    <header class="page-header">
        <button
            class="back-btn"
            onclick={() => activeTab.set("settingsScreen")}
        >
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width={18}
                height={18}
            />
            {$t.common.back}
        </button>
        <h1>{$t.chores.myChores}</h1>
        <div class="header-spacer"></div>
    </header>

    <div class="page-content">
        <SearchBox bind:searchQuery placeholder={$t.chores.searchPlaceholder} />

        <button
            class="create-new-item"
            onclick={() => activeTab.set("choreTemplatesScreen")}
        >
            <span class="create-new-icon">+</span>
            <span>{$t.chores.addNewChore}</span>
        </button>

        {#if loading}
            <ChoreListSkeleton count={4} />
        {:else if filteredChores.length === 0}
            <div class="empty-state">
                <span class="empty-icon">{normalizedQuery ? "🔍" : "📋"}</span>
                <span class="empty-text"
                    >{normalizedQuery
                        ? $t.chores.nothingFound
                        : $t.chores.noChoresYet}</span
                >
                <span class="empty-sub"
                    >{normalizedQuery
                        ? $t.chores.tryAnotherQuery
                        : $t.chores.addFirstChore}</span
                >
            </div>
        {:else}
            <div class="section-label">{$t.chores.familyChoresSection}</div>
            <div class="chore-list">
                {#each filteredChores as chore (chore.id)}
                    <ChoreListItem {chore} onClick={() => openDetail(chore)} />
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .page {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        background: transparent;
        padding-top: env(safe-area-inset-top);
    }

    .page-header {
        height: 56px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 4px;
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

    .back-btn {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 8px 12px;
        background: none;
        border: none;
        color: var(--accent);
        font-size: 15px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        border-radius: 10px;
        z-index: 1;
    }

    .back-btn:active {
        opacity: 0.6;
    }

    .header-spacer {
        width: 80px;
    }

    .page-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding-bottom: max(24px, env(safe-area-inset-bottom));
    }

    .create-new-item {
        display: flex;
        align-items: center;
        gap: 10px;

        width: calc(100% - 28px);

        padding: 12px 18px;
        margin: 0 14px 12px;

        background: color-mix(in srgb, var(--accent) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent) 26%, transparent);
        border-radius: var(--radius-pill, 999px);

        color: var(--accent);
        font-size: 14px;
        font-weight: 700;
        font-family: inherit;
        text-align: left;

        cursor: pointer;

        transition:
            transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
            opacity 0.15s ease;
    }

    .create-new-item:active {
        transform: scale(0.97);
        opacity: 0.85;
    }

    .create-new-icon {
        font-size: 18px;
        width: 28px;
        text-align: center;
    }

    .section-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.8px;
        padding: 8px 16px 6px;
    }

    .chore-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 0 16px;
    }

    /* EMPTY */

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 16px;
        gap: 6px;
    }

    .empty-icon {
        font-size: 36px;
        margin-bottom: 4px;
    }

    .empty-text {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .empty-sub {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-muted);
    }
</style>
