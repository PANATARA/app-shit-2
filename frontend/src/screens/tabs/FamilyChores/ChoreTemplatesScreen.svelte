<script lang="ts">
    import { activeTab, choreEditParams } from "$lib/navigation";
    import { getDefaultChores, createChoresFromDefault } from "$api/chores";
    import type { DefaultChore } from "$types/index";
    import Icon from "@iconify/svelte";
    import DefaultChoreListItem from "$features/chores/DefaultChoreListItem.svelte";
    import { swr } from "$lib/swr";
    import { t } from "$lib/i18n";
    import { language } from "$lib/settings";

    const defaultChoresStore = swr("default-chores", getDefaultChores);

    $: defaultChores = $defaultChoresStore.data ?? [];
    $: loading = $defaultChoresStore.loading;

    let saving = false;

    function openCreateCustom() {
        activeTab.set("choreCreateScreen");
    }

    async function handleCreateFromDefault(def: DefaultChore) {
        saving = true;
        try {
            await createChoresFromDefault({
                default_chore_ids: [def.id],
                language: $language,
            });
            activeTab.set("choreListScreen");
        } catch (e) {
            console.error(e);
        } finally {
            saving = false;
        }
    }
</script>

<div class="page">
    <header class="page-header">
        <button
            class="back-btn"
            onclick={() => activeTab.set("choreListScreen")}
        >
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width={18}
                height={18}
            />
            {$t.common.back}
        </button>
        <h1>{$t.chores.chooseTemplate}</h1>
        <div class="header-spacer"></div>
    </header>

    <div class="page-content">
        <button class="create-new-item" onclick={openCreateCustom}>
            <span class="create-new-icon">✏️</span>
            <span>{$t.chores.createCustom}</span>
        </button>

        {#if loading}
            <div class="empty-state">
                <span class="empty-sub">{$t.common.loading}</span>
            </div>
        {:else if defaultChores.length === 0}
            <div class="empty-state">
                <span class="empty-icon">📋</span>
                <span class="empty-text">{$t.chores.noTemplates}</span>
            </div>
        {:else}
            <div class="section-label">{$t.chores.standardChores}</div>
            <div class="chore-list">
                {#each defaultChores as def (def.id)}
                    <DefaultChoreListItem
                        chore={def}
                        onAdd={() => handleCreateFromDefault(def)}
                    />
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
        margin: 0 16px 12px;

        background: var(--accent-soft);
        border: 1.5px dashed var(--accent);
        border-radius: 20px;

        color: var(--accent);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        text-align: left;

        cursor: pointer;

        transition:
            transform 0.15s ease,
            opacity 0.15s ease;
    }

    .create-new-item:active {
        transform: scale(0.98);
        opacity: 0.7;
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
