<script lang="ts">
    import { onMount } from "svelte";
    import {
        activeTab,
        choreDetailParams,
        choreEditParams,
    } from "$lib/navigation";
    import { getChores } from "$api/chores";
    import type { ChoreItem } from "$types/index";
    import Icon from "@iconify/svelte";
    import SearchBox from "$ui/SearchBox.svelte";
    import ChoreListItem from "$features/chores/ChoreListItem.svelte";
    import AsyncStateView from "$ui/AsyncStateView.svelte";

    let chores: ChoreItem[] = [];
    let searchQuery = "";
    let loading = true;
    let error = false;

    onMount(loadData);

    async function loadData() {
        loading = true;
        error = false;
        try {
            const raw = await getChores();
            chores = raw.chores ?? [];
        } catch (e) {
            console.error(e);
            error = true;
        } finally {
            loading = false;
        }
    }

    function openDetail(chore: ChoreItem) {
        choreDetailParams.set({ chore });
        activeTab.set("choreDetailScreen");
    }

    function openTemplates() {
        activeTab.set("choreTemplatesScreen");
    }

    $: normalizedQuery = searchQuery.trim().toLowerCase();
    $: filteredChores = normalizedQuery
        ? chores.filter((c) => c.name.toLowerCase().includes(normalizedQuery))
        : chores;
</script>

<div class="page">
    <header class="page-header">
        <button
            class="back-btn"
            on:click={() => activeTab.set("settingsScreen")}
        >
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width="18"
                height="18"
            />
            Назад
        </button>
        <h1>Мои дела</h1>
        <div class="header-spacer"></div>
    </header>

    <div class="page-content">
        <SearchBox bind:searchQuery />

        <button class="create-new-item" on:click={openTemplates}>
            <span class="create-new-icon">+</span>
            <span>Добавить новое дело</span>
        </button>

        <AsyncStateView
            {loading}
            {error}
            errorMessage="Не удалось загрузить дела"
            onRetry={loadData}
            empty={filteredChores.length === 0}
            emptyMessage="Дел пока нет"
            shimmerCount={7}
        >
            <div class="section-label">Дела моего семейного круга</div>
            <div class="chore-list">
                {#each filteredChores as chore (chore.id)}
                    <ChoreListItem {chore} onClick={(c) => openDetail(c)} />
                {/each}
            </div>
        </AsyncStateView>
    </div>
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
        gap: 12px;
        width: calc(100% - 32px);
        padding: 13px 14px;
        background: var(--accent-soft);
        border: 1.5px dashed var(--accent);
        border-radius: 14px;
        color: var(--accent);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        text-align: left;
        margin: 0 16px 12px;
        transition: opacity 0.1s;
    }

    .create-new-item:active {
        opacity: 0.7;
    }

    .create-new-icon {
        font-size: 18px;
        width: 28px;
        text-align: center;
    }

    .section-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.6px;
        padding: 8px 16px 6px;
    }

    .chore-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 0 16px;
    }
</style>
