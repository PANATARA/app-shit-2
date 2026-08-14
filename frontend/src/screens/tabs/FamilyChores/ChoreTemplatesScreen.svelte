<script lang="ts">
    import { onMount } from "svelte";
    import { activeTab, choreEditParams } from "$lib/navigation";
    import { getDefaultChores, createChoresFromDefault } from "$api/chores";
    import type { DefaultChore } from "$types/index";
    import Icon from "@iconify/svelte";
    import AsyncStateView from "$ui/AsyncStateView.svelte";
    import DefaultChoreListItem from "$features/chores/DefaultChoreListItem.svelte";

    let defaultChores: DefaultChore[] = [];
    let loading = true;
    let saving = false;

    onMount(async () => {
        try {
            defaultChores = (await getDefaultChores()) ?? [];
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    });

    function openCreateCustom() {
        choreEditParams.set({ chore: undefined, fromTemplate: false });
        activeTab.set("choreEditScreen");
    }

    async function handleCreateFromDefault(def: DefaultChore) {
        saving = true;
        try {
            await createChoresFromDefault({
                default_chore_ids: [def.id],
                language: "ru",
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
            on:click={() => activeTab.set("choreListScreen")}
        >
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width="18"
                height="18"
            />
            Назад
        </button>
        <h1>Выбери шаблон</h1>
        <div class="header-spacer"></div>
    </header>

    <div class="page-content">
        <button class="create-new-item" on:click={openCreateCustom}>
            <span class="create-new-icon">✏️</span>
            <span>Создать своё дело</span>
        </button>

        <AsyncStateView {loading} shimmerCount={7}>
            <div class="section-label">Стандартные дела</div>
            <div class="chore-list">
                {#each defaultChores as def (def.id)}
                    <DefaultChoreListItem
                        chore={def}
                        onAdd={() => handleCreateFromDefault(def)}
                    />
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
