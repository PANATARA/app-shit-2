<script lang="ts">
    import {
        activeTab,
        choreDetailParams,
        choreEditParams,
    } from "$lib/navigation";
    import { deleteChore } from "$api/chores";
    import Icon from "@iconify/svelte";
    import ChoreIcon from "$ui/ChoreIcon.svelte";

    $: chore = $choreDetailParams.chore;

    let deleting = false;

    async function handleDelete() {
        if (!chore) return;
        deleting = true;
        try {
            await deleteChore(chore.id);
            activeTab.set("choreListScreen");
        } catch (e) {
            console.error(e);
        } finally {
            deleting = false;
        }
    }

    function openEdit() {
        choreEditParams.set({ chore });
        activeTab.set("choreEditScreen");
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
        <h1>{chore?.name ?? ""}</h1>
        <div class="header-spacer"></div>
    </header>

    {#if chore}
        <div class="page-content">
            <ChoreIcon {chore} size={80} />

            <div class="detail-info">
                {#if chore.description}
                    <div class="detail-field detail-field--block">
                        <span class="field-label">Описание</span>
                        <span class="field-value field-value--wrap"
                            >{chore.description}</span
                        >
                    </div>
                {/if}

                <div class="detail-field">
                    <span class="field-label">Награда</span>
                    <span class="field-value">🪙 {chore.valuation} монет</span>
                </div>

                <div class="detail-field">
                    <span class="field-label">Создано</span>
                    <span class="field-value">
                        {new Date(chore.created_at).toLocaleDateString(
                            "ru-RU",
                            {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            },
                        )}
                    </span>
                </div>
            </div>

            <div class="detail-actions">
                <button class="btn-edit" on:click={openEdit}>
                    <Icon
                        icon="material-symbols:edit-rounded"
                        width="18"
                        height="18"
                    />
                    Редактировать
                </button>
                <button
                    class="btn-delete"
                    on:click={handleDelete}
                    disabled={deleting}
                >
                    <Icon
                        icon="material-symbols:delete-rounded"
                        width="18"
                        height="18"
                    />
                    {deleting ? "Удаление..." : "Удалить"}
                </button>
            </div>
        </div>
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
        align-items: center;
        gap: 20px;
        padding: 8px 16px max(24px, env(safe-area-inset-bottom));
        flex: 1;
    }

    .detail-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .detail-field {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        background: var(--bg-card);
        border-radius: 12px;
        gap: 12px;
    }

    .detail-field--block {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }

    .field-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .field-value {
        font-size: 14px;
        color: var(--text-primary);
        font-weight: 500;
        text-align: right;
    }

    .field-value--wrap {
        width: 100%;
        text-align: left;
        white-space: pre-wrap;
    }

    .detail-actions {
        display: flex;
        gap: 10px;
        width: 100%;
    }

    .btn-edit {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 13px;
        background: var(--accent-soft);
        border: 1.5px solid var(--accent);
        border-radius: 14px;
        color: var(--accent);
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: opacity 0.15s;
    }

    .btn-edit:active {
        opacity: 0.7;
    }

    .btn-delete {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 13px;
        background: rgba(232, 124, 90, 0.1);
        border: 1.5px solid #e87c5a;
        border-radius: 14px;
        color: #e87c5a;
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: opacity 0.15s;
    }

    .btn-delete:active {
        opacity: 0.7;
    }
    .btn-delete:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
