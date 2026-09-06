<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Backbtn from "$ui/backbtn.svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import CustomTextarea from "$ui/CustomTextarea.svelte";
    import AvatarBuilder from "$features/settings/AvatarBuilder.svelte";
    import { activeTab } from "$lib/navigation";
    import { createEvent } from "$api/family";

    const dispatch = createEventDispatcher();

    let name = "";
    let description = "";

    // Локальная дата без UTC-сдвига
    let date = new Date().toLocaleDateString("en-CA");

    let avatar = {
        icon: "material-symbols:celebration-rounded",
        icon_color: "#ffffff",
        icon_bg: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
    };

    let loading = false;
    let errorMessage = "";

    $: canSubmit = name.trim().length > 0 && date.length > 0 && !loading;

    function handleBack() {
        activeTab.set("statsScreen");
    }

    async function handleAdd() {
        if (!canSubmit) return;

        loading = true;
        errorMessage = "";

        const payload = {
            name: name.trim(),
            description: description.trim() || null,
            icon: avatar.icon,
            icon_color: avatar.icon_color,
            icon_bg: avatar.icon_bg,
            date: `${date}T00:00:00`,
        };

        try {
            await createEvent(payload);

            dispatch("add");
            activeTab.set("statsScreen");
        } catch (error) {
            console.error("Failed to create event:", error);
            errorMessage = "Не удалось создать событие";
        } finally {
            loading = false;
        }
    }
</script>

<div class="page">
    <header class="page-header">
        <Backbtn label="Назад" on:click={handleBack} />
        <h1>Новое событие</h1>
        <div class="header-spacer" />
    </header>

    <div class="icon-header">
        <div class="section">
            <AvatarBuilder
                initialIcon={avatar.icon}
                initialIconColor={avatar.icon_color}
                initialBg={avatar.icon_bg}
                onchange={(v) => (avatar = v)}
            />
        </div>
    </div>

    <div class="detail-form">
        <div class="section">
            <div class="section-label">Название</div>

            <input
                class="field-input"
                type="text"
                placeholder="Куда едем или что отмечаем..."
                bind:value={name}
                maxlength={100}
            />
        </div>

        <div class="section">
            <div class="section-label">Детали</div>

            <CustomTextarea
                bind:value={description}
                placeholder="Описание события..."
                maxlength={500}
                rows={3}
            />

            <div class="divider" />

            <input class="field-input" type="date" bind:value={date} />
        </div>

        {#if errorMessage}
            <div class="error">
                {errorMessage}
            </div>
        {/if}
    </div>

    <div class="add-btn">
        <ButtonPrimaryGlow
            on:click={handleAdd}
            label={loading ? "Создание..." : "Добавить событие"}
            fullWidth
            disabled={!canSubmit}
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
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0;
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

    .icon-header {
        padding: 0 8px 4px;
    }

    .detail-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0 8px;
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border-radius: 22px;
        background: var(--surface);
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .section-label {
        font-size: 11px;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.8px;
    }

    .divider {
        height: 1px;
        background: var(--border);
        margin: 0 -4px;
    }

    .field-input {
        width: 100%;
        box-sizing: border-box;
        height: 44px;
        padding: 0 14px;
        border: none;
        outline: none;
        border-radius: 14px;
        background: var(--surface-alt);
        color: var(--text-primary);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        transition: box-shadow 0.2s ease;
    }

    .field-input:focus {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
    }

    .field-input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(0.5);
        cursor: pointer;
    }

    .error {
        padding: 12px 16px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--error, #ef4444) 10%, transparent);
        color: var(--error, #ef4444);
        font-size: 13px;
        font-weight: 600;
        text-align: center;
    }

    .add-btn {
        position: sticky;
        bottom: 0;
        padding: 12px 16px 8px;
        background: linear-gradient(to bottom, transparent, var(--bg) 40%);
    }
</style>
