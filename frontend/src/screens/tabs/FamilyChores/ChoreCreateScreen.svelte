<script lang="ts">
    import { activeTab } from "$lib/navigation";
    import { createChore } from "$api/chores";
    import Icon from "@iconify/svelte";
    import AvatarBuilder from "$features/settings/AvatarBuilder.svelte";
    import CustomInput from "$ui/CustomInput.svelte";
    import CustomTextarea from "$ui/CustomTextarea.svelte";
    import type { ChoreForm } from "$types/index";
    import { t } from "$lib/i18n";
    import { mutate } from "$lib/swr";

    let saving = false;

    let form: ChoreForm = {
        name: "",
        description: "",
        icon: "material-symbols:home-rounded",
        icon_color: "#ffffff",
        icon_bg: "linear-gradient(135deg, #8a7f6e 0%, #6b5f50 100%)",
        valuation: 10,
    };

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
        activeTab.set("choreTemplatesScreen");
    }

    async function handleSave() {
        if (!form.name.trim()) return;
        saving = true;
        try {
            await createChore(form);
            mutate("chores");
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
        <button class="back-btn" onclick={handleCancel}>
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width={18}
                height={18}
            />
            {$t.common.back}
        </button>
        <h1>{$t.chores.newChoreTitle}</h1>
        <div class="header-spacer"></div>
    </header>

    <div class="page-content">
        <div class="form-fields">
            <AvatarBuilder
                initialIcon={form.icon}
                initialIconColor={form.icon_color}
                initialBg={form.icon_bg}
                onchange={updateAvatar}
            />

            <div class="field">
                <span class="field-label">{$t.chores.name}</span>
                <CustomInput
                    bind:value={form.name}
                    placeholder={$t.chores.namePlaceholder}
                    maxlength={100}
                />
            </div>

            <div class="field">
                <span class="field-label">{$t.chores.description}</span>
                <CustomTextarea
                    bind:value={form.description}
                    placeholder={$t.chores.descPlaceholder}
                    maxlength={500}
                    rows={3}
                />
            </div>

            <div class="form-actions">
                <button class="btn-cancel" onclick={handleCancel}>{$t.common.cancel}</button
                >
                <button
                    class="btn-save"
                    onclick={handleSave}
                    disabled={saving || !form.name.trim()}
                >
                    {saving ? $t.common.saving : $t.common.create}
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

    .form-fields {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 0 16px;
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

    .btn-cancel {
        flex: 1;
        padding: 13px;
        border: none;
        border-radius: 20px;
        background: var(--surface);
        color: var(--text-muted);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition:
            transform 0.15s ease,
            opacity 0.15s ease;
    }

    .btn-cancel:active {
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
        font-family: inherit;
        cursor: pointer;
        transition:
            transform 0.15s ease,
            opacity 0.15s ease;
    }

    .btn-save:active:not(:disabled) {
        transform: scale(0.97);
        opacity: 0.8;
    }

    .btn-save:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
</style>
