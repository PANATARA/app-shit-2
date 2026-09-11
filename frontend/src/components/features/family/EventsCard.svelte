<script lang="ts">
    import Icon from "@iconify/svelte";
    import type { FamilyEvent } from "$types/index";
    import EventDetailSheet from "$screens/modal/EventDetailSheet.svelte";
    import { activeTab } from "$lib/navigation";
    import { language } from "$lib/settings";
    import { t } from "$lib/i18n";
    import Card from "$ui/Card.svelte";
    import { deleteEvent, updateEvent } from "$api/family";
    import { mutate } from "$lib/swr";

    export let loading = true;
    export let events: FamilyEvent[] = [];

    let selectedEvent: FamilyEvent | null = null;

    function getDateLabel(dateStr: string, currentLang: string): {
        text: string;
        badge: string;
        cls: string;
    } {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const date = new Date(dateStr);
        const dateMidnight = new Date(dateStr);
        dateMidnight.setHours(0, 0, 0, 0);

        const diff = Math.round((dateMidnight.getTime() - today.getTime()) / 86400000);
        const loc = currentLang === "en" ? "en-US" : "ru-RU";
        const text = date
            .toLocaleDateString(loc, { day: "numeric", month: "short" })
            .replace(".", "");

        if (diff === 0) return { text, badge: $t.common.today, cls: "today" };
        if (diff === 1) return { text, badge: $t.common.tomorrow, cls: "soon" };
        if (diff === 2) return { text, badge: currentLang === "en" ? "in 2 days" : "послезавтра", cls: "soon" };
        if (diff > 2) return { text, badge: $t.common.daysIn.replace("{n}", String(diff)), cls: "upcoming" };
        return { text, badge: $t.events.alreadyPassed, cls: "past" };
    }

    async function handleDelete(e: CustomEvent<{ id: string | number }>) {
        const id = String(e.detail.id);
        try {
            await deleteEvent(id);
            events = events.filter((ev) => String(ev.id) !== id);
            mutate("family-events", events);
            mutate("family-all-events");
        } catch (err) {
            console.error("Failed to delete event:", err);
        }
    }

    async function handleReschedule(e: CustomEvent<{ id: string | number; date: string }>) {
        const id = String(e.detail.id);
        const newDate = e.detail.date;
        try {
            await updateEvent(id, { date: `${newDate}T00:00:00` });
            events = events.map((ev) =>
                String(ev.id) === id ? { ...ev, date: `${newDate}T00:00:00` } : ev
            );
            mutate("family-events", events);
            mutate("family-all-events");
        } catch (err) {
            console.error("Failed to reschedule event:", err);
        }
    }
</script>

<Card
    title={$t.stats.upcomingEvents}
    glowDirection="bottom-left"
    gradientDirection="to-left"
>
    <!-- HEADER ACTIONS -->
    <div slot="action" class="header-actions">
        <button
            class="add-btn"
            on:click={() => activeTab.set("eventCreate")}
            aria-label={$t.events.newEvent}
        >
            <Icon icon="material-symbols:add-rounded" width={20} />
        </button>
    </div>

    <!-- CONTENT -->
    {#if loading}
        <div class="list">
            {#each Array(2) as _}
                <div class="event-row skeleton-row">
                    <div class="skeleton icon-skeleton"></div>
                    <div class="event-info">
                        <div class="skeleton name-skeleton"></div>
                        <div class="skeleton desc-skeleton"></div>
                    </div>
                    <div class="skeleton badge-skeleton"></div>
                </div>
            {/each}
        </div>
    {:else if !events.length}
        <div class="empty">
            <div class="empty-icon-wrap">
                <Icon icon="material-symbols:celebration-outline-rounded" width={34} />
            </div>
            <span class="empty-text">{$t.stats.noEvents}</span>
            <span class="empty-sub">{$t.stats.addEventHint}</span>
            <button
                class="empty-cta-btn"
                on:click={() => activeTab.set("eventCreate")}
            >
                <Icon icon="material-symbols:add-rounded" width={18} />
                <span>{$t.events.addEvent}</span>
            </button>
        </div>
    {:else}
        <div class="list">
            {#each events as event (event.id)}
                {@const label = getDateLabel(event.date, $language)}
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
                        <span class="event-date-text">{label.text}</span>
                    </div>

                    <div class="date-col">
                        <span class="badge badge-{label.cls}">{label.badge}</span>
                        <Icon
                            icon="material-symbols:chevron-right-rounded"
                            width={18}
                            class="chevron"
                        />
                    </div>
                </button>
            {/each}
        </div>

        <button
            class="view-all-footer"
            on:click={() => activeTab.set("eventsListScreen")}
        >
            <span>{$t.events.viewAll}</span>
            <Icon icon="material-symbols:arrow-forward-rounded" width={18} />
        </button>
    {/if}
</Card>

{#if selectedEvent}
    <EventDetailSheet
        event={selectedEvent}
        on:close={() => (selectedEvent = null)}
        on:delete={handleDelete}
        on:reschedule={handleReschedule}
    />
{/if}

<style>
    /* HEADER ACTIONS */
    .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .all-events-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;

        border-radius: 12px;
        border: none;

        background: color-mix(in srgb, var(--accent) 10%, transparent);
        color: var(--accent);

        font-size: 12px;
        font-weight: 700;
        cursor: pointer;

        transition: transform 0.15s ease, background 0.15s ease;
    }

    .all-events-btn:active {
        transform: scale(0.95);
        background: color-mix(in srgb, var(--accent) 20%, transparent);
    }

    .add-btn {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 32px;
        height: 32px;

        border-radius: 10px;
        border: none;

        background: color-mix(in srgb, var(--accent) 14%, transparent);
        color: var(--accent);

        cursor: pointer;
        transition: transform 0.15s ease, background 0.15s ease;
    }

    .add-btn:active {
        background: color-mix(in srgb, var(--accent) 24%, transparent);
        transform: scale(0.93);
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
        padding: 12px 14px;

        border: 1px solid color-mix(in srgb, var(--border) 45%, transparent);
        border-radius: 18px;

        background: color-mix(in srgb, var(--accent) 4%, var(--surface-alt));
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

        cursor: pointer;
        font-family: inherit;

        transition:
            transform 0.15s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
    }

    .event-row:active {
        transform: scale(0.98);
        background: color-mix(in srgb, var(--accent) 12%, var(--surface-alt));
        box-shadow: none;
    }

    /* ICON */
    .icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 44px;
        height: 44px;

        flex-shrink: 0;
        border-radius: 15px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }

    /* INFO */
    .event-info {
        flex: 1;
        min-width: 0;

        display: flex;
        flex-direction: column;
        gap: 2px;
        text-align: left;
    }

    .event-name {
        font-size: 15px;
        font-weight: 800;
        color: var(--text-primary);

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: -0.2px;
    }

    .event-desc {
        font-size: 12px;
        color: var(--text-muted);

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .event-date-text {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        margin-top: 1px;
    }

    /* DATE & BADGE */
    .date-col {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
    }

    .badge {
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2px;
    }

    .badge-today {
        background: color-mix(in srgb, #22c55e 18%, transparent);
        color: #16a34a;
    }

    :global(body.dark) .badge-today {
        color: #4ade80;
    }

    .badge-soon {
        background: color-mix(in srgb, #f59e0b 18%, transparent);
        color: #d97706;
    }

    :global(body.dark) .badge-soon {
        color: #fbbf24;
    }

    .badge-upcoming {
        background: color-mix(in srgb, var(--accent) 14%, transparent);
        color: var(--accent);
    }

    .badge-past {
        background: color-mix(in srgb, var(--text-muted) 14%, transparent);
        color: var(--text-muted);
    }

    :global(.chevron) {
        color: var(--text-muted);
        opacity: 0.55;
    }

    /* FOOTER */
    .view-all-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        width: 100%;
        margin-top: 10px;
        padding: 10px;

        border: none;
        border-radius: 14px;

        background: color-mix(in srgb, var(--accent) 8%, transparent);
        color: var(--accent);

        font-size: 13px;
        font-weight: 700;
        font-family: inherit;

        cursor: pointer;
        transition: transform 0.15s ease, background 0.15s ease;
    }

    .view-all-footer:active {
        transform: scale(0.98);
        background: color-mix(in srgb, var(--accent) 16%, transparent);
    }

    /* EMPTY */
    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 18px 12px;
        gap: 6px;
        text-align: center;
    }

    .empty-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 18px;
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        color: var(--accent);
        margin-bottom: 4px;
    }

    .empty-text {
        font-size: 15px;
        font-weight: 800;
        color: var(--text-primary);
    }

    .empty-sub {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-muted);
        max-width: 220px;
        line-height: 1.35;
    }

    .empty-cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
        padding: 8px 16px;

        background: var(--accent);
        color: #ffffff;
        border: none;
        border-radius: 12px;

        font-size: 13px;
        font-weight: 700;
        cursor: pointer;

        box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent);
        transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .empty-cta-btn:active {
        transform: scale(0.95);
        opacity: 0.9;
    }

    /* SKELETON */
    .skeleton-row {
        pointer-events: none;
    }

    .skeleton {
        background: linear-gradient(
            90deg,
            var(--surface-alt) 25%,
            var(--border) 50%,
            var(--surface-alt) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        from { background-position: 200% 0; }
        to { background-position: -200% 0; }
    }

    .icon-skeleton {
        width: 44px;
        height: 44px;
        border-radius: 15px;
        flex-shrink: 0;
    }

    .name-skeleton {
        width: 120px;
        height: 14px;
        border-radius: 6px;
    }

    .desc-skeleton {
        width: 80px;
        height: 10px;
        border-radius: 4px;
        margin-top: 6px;
    }

    .badge-skeleton {
        width: 50px;
        height: 20px;
        border-radius: 999px;
    }
</style>
