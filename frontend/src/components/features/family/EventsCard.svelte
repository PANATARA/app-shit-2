<script lang="ts">
    import Icon from "@iconify/svelte";
    import type { FamilyEvent } from "$types/index";
    import EventDetailSheet from "$screens/modal/EventDetailSheet.svelte";
    import { activeTab } from "$lib/navigation";
    import Card from "$ui/Card.svelte";

    export let loading = true;
    export let events = [];

    let selectedEvent: FamilyEvent | null = null;

    function getDateLabel(dateStr: string): {
        text: string;
        badge: string;
        cls: string;
    } {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateStr);
        const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
        const text = date
            .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
            .replace(".", "");

        if (diff === 0) return { text, badge: "сегодня", cls: "today" };
        if (diff === 1) return { text, badge: "завтра", cls: "soon" };
        if (diff === 2) return { text, badge: "послезавтра", cls: "soon" };
        return { text, badge: `через ${diff} дн`, cls: "upcoming" };
    }
</script>

<Card
    title="Ближайшие события"
    glowDirection="bottom-left"
    gradientDirection="to-left"
>
    <button
        slot="action"
        class="add-btn"
        on:click={() => activeTab.set("eventCreate")}
    >
        <Icon icon="material-symbols:add-rounded" width={20} />
    </button>

    {#if !events.length}
        <div class="empty">
            <span class="empty-icon">🗓️</span>
            <span class="empty-text">Событий пока нет</span>
            <span class="empty-sub">Добавьте поездку или праздник</span>
        </div>
    {:else}
        <div class="list">
            {#each events as event}
                {@const label = getDateLabel(event.date)}
                <button
                    class="event-row"
                    on:click={() => (selectedEvent = event)}
                >
                    <div class="icon-wrap" style="background: {event.icon_bg}">
                        <Icon
                            icon={event.icon}
                            width={22}
                            color={event.icon_color}
                        />
                    </div>
                    <div class="event-info">
                        <span class="event-name">{event.name}</span>
                        {#if event.description}
                            <span class="event-desc">{event.description}</span>
                        {/if}
                    </div>
                    <div class="date-col">
                        <span class="date-text">{label.text}</span>
                        <span class="badge badge-{label.cls}"
                            >{label.badge}</span
                        >
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</Card>

{#if selectedEvent}
    <EventDetailSheet
        event={selectedEvent}
        on:close={() => (selectedEvent = null)}
    />
{/if}

<style>
    .add-btn {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 30px;
        height: 30px;

        border-radius: 50%;
        border: none;

        background: color-mix(in srgb, var(--accent) 14%, transparent);

        color: var(--accent);

        cursor: pointer;

        transition: background 0.18s ease;
    }

    .add-btn:active {
        background: color-mix(in srgb, var(--accent) 24%, transparent);
        transform: scale(0.95);
    }

    /* LIST */

    .list {
        position: relative;
        z-index: 1;

        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .event-row {
        display: flex;
        align-items: center;
        gap: 12px;

        width: 100%;

        padding: 12px;

        border: none;
        border-radius: 20px;

        background: color-mix(in srgb, var(--accent) 5%, var(--surface-alt));

        cursor: pointer;

        transition:
            transform 0.18s ease,
            background 0.2s ease;
    }

    .event-row:active {
        transform: scale(0.97);
        background: color-mix(in srgb, var(--accent) 10%, var(--surface-alt));
    }

    /* ICON */

    .icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 44px;
        height: 44px;

        flex-shrink: 0;

        border-radius: 14px;
    }

    /* INFO */

    .event-info {
        flex: 1;
        min-width: 0;

        display: flex;
        flex-direction: column;
        gap: 3px;
        text-align: left;
    }

    .event-name {
        font-size: 15px;
        font-weight: 800;

        color: var(--text-primary);

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .event-desc {
        font-size: 12px;

        color: var(--text-muted);

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* DATE */

    .date-col {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        gap: 4px;

        flex-shrink: 0;
    }

    .date-text {
        font-size: 13px;
        font-weight: 700;

        color: var(--accent);
    }

    .badge {
        padding: 2px 8px;

        border-radius: 999px;

        font-size: 10px;
        font-weight: 700;
    }

    .badge-today {
        background: color-mix(in srgb, #4ade80 18%, transparent);
        color: #4ade80;
    }

    .badge-soon {
        background: color-mix(in srgb, #fbbf24 18%, transparent);
        color: #fbbf24;
    }

    .badge-upcoming {
        background: color-mix(in srgb, var(--accent) 14%, transparent);
        color: var(--accent);
    }

    /* EMPTY */

    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;

        padding: 16px;
        gap: 6px;
    }

    .empty-icon {
        font-size: 32px;
        margin-bottom: 4px;
    }

    .empty-text {
        font-size: 14px;
        font-weight: 800;

        color: var(--text-primary);
    }

    .empty-sub {
        font-size: 12px;
        font-weight: 500;

        color: var(--text-muted);
    }
</style>
