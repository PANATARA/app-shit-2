<script lang="ts">
    import {
        activeTab,
        choreEditParams,
        choreDetailParams,
    } from "$lib/navigation";
    import { updateChore, deleteChore } from "$api/chores";
    import Icon from "@iconify/svelte";
    import AvatarBuilder from "$features/settings/AvatarBuilder.svelte";
    import ChoreIcon from "$ui/ChoreIcon.svelte";
    import CustomInput from "$ui/CustomInput.svelte";
    import CustomTextarea from "$ui/CustomTextarea.svelte";
    import type { ChoreForm } from "$types/index";
    import { t } from "$lib/i18n";
    import { mutate } from "$lib/swr";

    const chore = $choreEditParams.chore;

    let saving = false;
    let deleting = false;

    let form: ChoreForm = {
        name: chore?.name ?? "",
        description: chore?.description ?? "",
        icon: chore?.icon ?? "material-symbols:home-rounded",
        icon_color: chore?.icon_color ?? "#ffffff",
        icon_bg:
            chore?.icon_bg ??
            "linear-gradient(135deg, #8a7f6e 0%, #6b5f50 100%)",
        valuation: chore?.valuation ?? 10,
    };

    const isDefaultChore = !!chore?.default_chore_id;

    function updateAvatar(v: {
        icon: string;
        icon_color: string;
        icon_bg: string;
    }) {
        if (
            v.icon === form.icon &&
            v.icon_color === form.icon_color &&
            v.icon_bg === form.icon_bg
        )
            return;

        form = { ...form, ...v };
    }

    function handleCancel() {
        activeTab.set("choreListScreen");
    }

    async function handleSave() {
        if (!chore || deleting) return;

        saving = true;

        try {
            const updated = await updateChore(chore.id, form);
            mutate("chores");
            choreDetailParams.set({ chore: updated });
        } catch (e) {
            console.error(e);
        } finally {
            saving = false;
        }
    }

    async function handleDelete() {
        if (!chore || saving || deleting) return;

        deleting = true;

        try {
            await deleteChore(chore.id);
            mutate("chores");
            activeTab.set("choreListScreen");
        } catch (e) {
            console.error(e);
        } finally {
            deleting = false;
        }
    }
</script>

<div class="page">
    <header class="page-header">
        <button class="back-btn" onclick={handleCancel}>
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width={18}
                height={18}
            />
            {$t.common.back}
        </button>

        <h1>{$t.chores.editChoreTitle}</h1>

        <div class="header-spacer"></div>
    </header>

    <div class="page-content">
        <div class="form-fields">
            {#if isDefaultChore}
                <div class="avatar-wrapper">
                    <ChoreIcon {chore} size={80} />
                </div>
            {:else}
                <AvatarBuilder
                    initialIcon={form.icon}
                    initialIconColor={form.icon_color}
                    initialBg={form.icon_bg}
                    onchange={updateAvatar}
                />
            {/if}

            <div class="field">
                <span class="field-label">{$t.chores.name}</span>

                <CustomInput
                    bind:value={form.name}
                    placeholder={$t.chores.namePlaceholder}
                    maxlength={100}
                    disabled={isDefaultChore || deleting}
                />
            </div>

            <div class="field">
                <span class="field-label">{$t.chores.description}</span>

                <CustomTextarea
                    bind:value={form.description}
                    placeholder={$t.chores.descPlaceholder}
                    maxlength={500}
                    rows={3}
                    disabled={deleting}
                />
            </div>

            <div class="form-actions">
                <button
                    class="btn-cancel"
                    onclick={handleCancel}
                    disabled={saving || deleting}
                >
                    {$t.common.cancel}
                </button>

                <button
                    class="btn-save"
                    onclick={handleSave}
                    disabled={saving || deleting}
                >
                    {saving ? $t.common.saving : $t.common.save}
                </button>
            </div>

            <div class="danger-zone">
                <button
                    class="btn-delete"
                    onclick={handleDelete}
                    disabled={saving || deleting}
                >
                    <Icon
                        icon="material-symbols:delete-rounded"
                        width={18}
                        height={18}
                    />

                    {deleting ? $t.common.deleting : $t.chores.deleteChore}
                </button>
            </div>
        </div>
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

    .back-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .header-spacer {
        width: 80px;
    }

    .page-content {
        flex: 1;
        overflow-y: auto;
        padding-bottom: max(24px, env(safe-area-inset-bottom));
    }

    .form-fields {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 0 16px;
    }

    .avatar-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .field-label {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: var(--text-muted);
    }

    .form-actions {
        display: flex;
        gap: 10px;
        margin-top: 6px;
    }

    .btn-cancel,
    .btn-save,
    .btn-delete {
        font-family: inherit;
        cursor: pointer;
        transition:
            transform 0.15s ease,
            opacity 0.15s ease;
    }

    .btn-cancel {
        flex: 1;
        padding: 13px;
        border: none;
        border-radius: 20px;
        background: var(--surface);
        color: var(--text-muted);
        font-size: 15px;
        font-weight: 600;
    }

    .btn-cancel:active:not(:disabled) {
        transform: scale(0.97);
        opacity: 0.7;
    }

    .btn-save {
        flex: 2;
        padding: 13px;
        border: none;
        border-radius: 20px;
        background: var(--accent);
        color: #2a1800;
        font-size: 15px;
        font-weight: 700;
    }

    .btn-save:active:not(:disabled) {
        transform: scale(0.97);
        opacity: 0.8;
    }

    .btn-delete {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 13px;
        border-radius: 20px;
        border: 1.5px solid #e87c5a;
        background: rgba(232, 124, 90, 0.08);
        color: #e87c5a;
        font-size: 15px;
        font-weight: 600;
    }

    .btn-delete:active:not(:disabled) {
        transform: scale(0.97);
        opacity: 0.7;
    }

    .btn-cancel:disabled,
    .btn-save:disabled,
    .btn-delete:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .danger-zone {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border, rgba(128, 128, 128, 0.12));
    }
</style>
