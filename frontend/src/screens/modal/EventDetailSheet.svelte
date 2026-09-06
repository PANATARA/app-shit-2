<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import BottomSheet from "$ui/BottomSheet.svelte";
    import Icon from "@iconify/svelte";
    import CustButton from "$ui/button.svelte";
    import type { FamilyEvent } from "$types/index";

    const dispatch = createEventDispatcher();

    export let event: FamilyEvent;

    let rescheduleMode = false;
    let newDate = event.date;

    function close() { dispatch("close"); }

    function handleDelete() {
        dispatch("delete", { id: event.id });
        close();
    }

    function handleReschedule() {
        if (!newDate || newDate === event.date) {
            rescheduleMode = false;
            return;
        }
        dispatch("reschedule", { id: event.id, date: newDate });
        close();
    }

    function formatFullDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    }

    function getDaysLeft(dateStr: string): string {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateStr);
        const diff = Math.round((date.getTime() - today.getTime()) / 86400000);

        if (diff === 0) return "сегодня";
        if (diff === 1) return "завтра";
        if (diff === 2) return "послезавтра";
        if (diff > 0)   return `через ${diff} дней`;
        return "уже прошло";
    }
</script>

<BottomSheet title="" on:close={close} flyY={999} flyDuration={320}>
    <div class="content">

        <!-- HERO -->
        <div class="event-hero">
            <div class="hero-icon" style="background: {event.icon_bg}">
                <Icon icon={event.icon} width={32} color={event.icon_color} />
            </div>
            <div class="hero-info">
                <span class="hero-name">{event.name}</span>
                <span class="hero-date">{formatFullDate(event.date)}</span>
            </div>
        </div>

        <!-- INFO -->
        <div class="info-card">
            <div class="info-row">
                <Icon icon="material-symbols:calendar-clock-rounded" width={18} color="var(--accent)" />
                <span class="info-label">Когда</span>
                <span class="info-value">{getDaysLeft(event.date)}</span>
            </div>
            {#if event.description}
                <div class="divider" />
                <div class="info-row info-row--col">
                    <div class="info-row-head">
                        <Icon icon="material-symbols:notes-rounded" width={18} color="var(--accent)" />
                        <span class="info-label">Описание</span>
                    </div>
                    <span class="info-desc">{event.description}</span>
                </div>
            {/if}
        </div>

        <!-- ACTIONS -->
        {#if rescheduleMode}
            <div class="reschedule-card">
                <span class="reschedule-label">Новая дата</span>
                <input class="field-input" type="date" bind:value={newDate} />
                <div class="reschedule-actions">
                    <CustButton label="Сохранить" variant="primary" onClick={handleReschedule} />
                    <CustButton
                        label="Отмена"
                        variant="secondary"
                        onClick={() => { rescheduleMode = false; newDate = event.date; }}
                    />
                </div>
            </div>
        {:else}
            <div class="actions-card">
                <CustButton label="Перенести дату" variant="secondary" onClick={() => (rescheduleMode = true)} />
                <CustButton label="Удалить событие" variant="danger" onClick={handleDelete} />
            </div>
        {/if}

    </div>
</BottomSheet>

<style>
    .content {
        display: flex;
        flex-direction: column;
        gap: 12px;

        /* безопасный отступ снизу для iPhone */
        padding: 4px 16px max(16px, env(safe-area-inset-bottom));

        /* не даём контенту вылезти за экран */
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
    }

    /* HERO */

    .event-hero {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 4px 0 4px;

        /* имя не вылезает за края */
        min-width: 0;
    }

    .hero-icon {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 56px;
        height: 56px;

        flex-shrink: 0;

        border-radius: 18px;
    }

    .hero-info {
        display: flex;
        flex-direction: column;
        gap: 5px;

        min-width: 0;
        flex: 1;
    }

    .hero-name {
        font-size: 18px;
        font-weight: 800;

        color: var(--text-primary);

        /* обрезаем длинные названия */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .hero-date {
        font-size: 13px;
        font-weight: 500;

        color: var(--text-muted);

        text-transform: capitalize;

        /* дата тоже не вылезает */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* INFO CARD */

    .info-card {
        border-radius: 20px;
        background: color-mix(in srgb, var(--accent) 6%, var(--surface));
        padding: 14px 16px;

        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .info-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .info-row--col {
        flex-direction: column;
        align-items: flex-start;
    }

    .info-row-head {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .info-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        flex: 1;
    }

    .info-value {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .info-desc {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        line-height: 1.5;
        padding-left: 26px;

        /* многострочный текст не вылезает */
        word-break: break-word;
        overflow-wrap: break-word;
    }

    .divider {
        height: 0.5px;
        background: color-mix(in srgb, var(--accent) 15%, transparent);
    }

    /* RESCHEDULE */

    .reschedule-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px 16px;
        border-radius: 20px;
        background: color-mix(in srgb, var(--accent) 6%, var(--surface));
    }

    .reschedule-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
    }

    .field-input {
        width: 100%;
        padding: 10px 14px;
        border-radius: 14px;
        border: 1.5px solid color-mix(in srgb, var(--accent) 25%, transparent);
        background: color-mix(in srgb, var(--accent) 6%, var(--surface));
        color: var(--text-primary);
        font-size: 15px;
        font-weight: 600;
        outline: none;
        box-sizing: border-box;

        /* на iOS date input иногда выезжает */
        max-width: 100%;
    }

    .field-input:focus {
        border-color: var(--accent);
    }

    .reschedule-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    /* ACTIONS */

    .actions-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-bottom: 4px;
    }
</style>
