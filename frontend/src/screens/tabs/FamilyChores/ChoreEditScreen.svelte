<script lang="ts">
    import {
        activeTab,
        choreEditParams,
        choreDetailParams,
    } from "$lib/navigation";
    import { createChore, updateChore } from "$api/chores";
    import Icon from "@iconify/svelte";
    import ChoreFormComp from "$features/settings/ChoreForm.svelte";

    $: chore = $choreEditParams.chore;
    $: isEditing = !!chore;

    let saving = false;

    let form = {
        name: chore?.name ?? "",
        description: chore?.description ?? "",
        icon: chore?.icon ?? "material-symbols:home-rounded",
        icon_color: chore?.icon_color ?? "#000",
        icon_bg: chore?.icon_bg ?? "#fff",
        valuation: chore?.valuation ?? 10,
    };

    // Синхронизируем форму если params изменились
    $: if (chore) {
        form = {
            name: chore.name,
            description: chore.description ?? "",
            icon: chore.icon,
            icon_color: chore.icon_color,
            icon_bg: chore.icon_bg,
            valuation: chore.valuation,
        };
    }

    function handleCancel() {
        if (isEditing) {
            activeTab.set("choreDetailScreen");
        } else {
            activeTab.set("choreTemplatesScreen");
        }
    }

    async function handleSave() {
        saving = true;
        try {
            if (isEditing && chore) {
                const updated = await updateChore(chore.id, form);
                choreDetailParams.set({ chore: updated });
                activeTab.set("choreDetailScreen");
            } else {
                await createChore(form);
                activeTab.set("choreListScreen");
            }
        } catch (e) {
            console.error(e);
        } finally {
            saving = false;
        }
    }
</script>

<div class="page">
    <header class="page-header">
        <button class="back-btn" on:click={handleCancel}>
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width="18"
                height="18"
            />
            Назад
        </button>
        <h1>{isEditing ? "Редактировать" : "Новое дело"}</h1>
        <div class="header-spacer"></div>
    </header>

    <div class="page-content">
        <ChoreFormComp
            bind:form
            selectedChore={chore}
            mode={isEditing ? "edit" : "create"}
            {saving}
            submitText={isEditing ? "Сохранить" : "Создать"}
            cancelText="Отмена"
            onCancel={handleCancel}
            onSubmit={handleSave}
        />
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
        flex: 1;
        overflow-y: auto;
        padding-bottom: max(24px, env(safe-area-inset-bottom));
    }
</style>
