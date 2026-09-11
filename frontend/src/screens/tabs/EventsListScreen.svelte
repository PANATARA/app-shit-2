<script lang="ts">
    import { onMount } from "svelte";
    import Icon from "@iconify/svelte";
    import Backbtn from "$ui/backbtn.svelte";
    import EventDetailSheet from "$screens/modal/EventDetailSheet.svelte";
    import type { FamilyEvent } from "$types/index";
    import { getAllEvents, deleteEvent, updateEvent } from "$api/family";
    import { activeTab, navigateBack } from "$lib/navigation";
    import { language } from "$lib/settings";
    import { t } from "$lib/i18n";
    import { swr, mutate } from "$lib/swr";

    const PAGE_LIMIT = 20;

    const initialEventsStore = swr<FamilyEvent[]>("family-all-events", () =>
        getAllEvents({ limit: PAGE_LIMIT, offset: 0 }).then((res) =>
            Array.isArray(res) ? res : (res?.items || [])
        )
    );

    let olderEvents: FamilyEvent[] = [];
    let events: FamilyEvent[] = [];
    let offset = PAGE_LIMIT;
    let loadingMore = false;
    let hasMore = true;
    let error: string | null = null;

    let sentinelEl: HTMLDivElement;
    let selectedEvent: FamilyEvent | null = null;

    $: initialEvents = $initialEventsStore.data ?? [];
    $: loadingInitial = $initialEventsStore.loading;
    $: if ($initialEventsStore.error) {
        error = $t.common.loadError;
    }

    // Реактивно объединяем начальные события из SWR с подгруженными страницами
    $: {
        const idSet = new Set(initialEvents.map((e) => e.id));
        const filteredOlder = olderEvents.filter((e) => !idSet.has(e.id));
        events = [...initialEvents, ...filteredOlder];
    }

    interface DateMeta {
        formattedDate: string;
        badge: string;
        cls: "today" | "soon" | "upcoming" | "past";
        isPast: boolean;
    }

    function getDateMeta(dateStr: string, currentLang: string): DateMeta {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const date = new Date(dateStr);
        const dateMidnight = new Date(dateStr);
        dateMidnight.setHours(0, 0, 0, 0);

        const diff = Math.round((dateMidnight.getTime() - today.getTime()) / 86400000);
        const loc = currentLang === "en" ? "en-US" : "ru-RU";
        const isCurrentYear = date.getFullYear() === today.getFullYear();

        const formattedDate = date.toLocaleDateString(loc, {
            day: "numeric",
            month: "short",
            ...(isCurrentYear ? {} : { year: "numeric" }),
        }).replace(".", "");

        if (diff === 0) {
            return { formattedDate, badge: $t.common.today, cls: "today", isPast: false };
        }
        if (diff === 1) {
            return { formattedDate, badge: $t.common.tomorrow, cls: "soon", isPast: false };
        }
        if (diff === 2) {
            return {
                formattedDate,
                badge: currentLang === "en" ? "in 2 days" : "послезавтра",
                cls: "soon",
                isPast: false,
            };
        }
        if (diff > 2) {
            return {
                formattedDate,
                badge: $t.common.daysIn.replace("{n}", String(diff)),
                cls: "upcoming",
                isPast: false,
            };
        }
        if (diff === -1) {
            return { formattedDate, badge: $t.common.yesterday, cls: "past", isPast: true };
        }

        const absDiff = Math.abs(diff);
        return {
            formattedDate,
            badge: $t.common.daysAgo ? $t.common.daysAgo.replace("{n}", String(absDiff)) : `${absDiff} дн. назад`,
            cls: "past",
            isPast: true,
        };
    }

    async function loadOlderEvents() {
        if (loadingMore || !hasMore || loadingInitial) return;
        loadingMore = true;

        try {
            const res = await getAllEvents({ limit: PAGE_LIMIT, offset });
            const items: FamilyEvent[] = Array.isArray(res) ? res : (res?.items || []);

            olderEvents = [...olderEvents, ...items];
            offset += items.length;

            if (items.length < PAGE_LIMIT) {
                hasMore = false;
            }
        } catch (err) {
            console.error("Failed to load older events:", err);
        } finally {
            loadingMore = false;
        }
    }

    function reload() {
        olderEvents = [];
        offset = PAGE_LIMIT;
        hasMore = true;
        initialEventsStore.revalidate();
    }

    async function handleDelete(e: CustomEvent<{ id: string | number }>) {
        const id = String(e.detail.id);
        try {
            await deleteEvent(id);
            const updatedInitial = initialEvents.filter((ev) => String(ev.id) !== id);
            olderEvents = olderEvents.filter((ev) => String(ev.id) !== id);
            mutate("family-all-events", updatedInitial);
            mutate("family-events");
        } catch (err) {
            console.error("Failed to delete event:", err);
        }
    }

    async function handleReschedule(e: CustomEvent<{ id: string | number; date: string }>) {
        const id = String(e.detail.id);
        const newDate = e.detail.date;
        try {
            await updateEvent(id, { date: `${newDate}T00:00:00` });
            const updatedInitial = initialEvents.map((ev) =>
                String(ev.id) === id ? { ...ev, date: `${newDate}T00:00:00` } : ev
            );
            olderEvents = olderEvents.map((ev) =>
                String(ev.id) === id ? { ...ev, date: `${newDate}T00:00:00` } : ev
            );
            mutate("family-all-events", updatedInitial);
            mutate("family-events");
        } catch (err) {
            console.error("Failed to reschedule event:", err);
        }
    }

    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loadingInitial) {
                    loadOlderEvents();
                }
            },
            { rootMargin: "300px" }
        );

        if (sentinelEl) {
            observer.observe(sentinelEl);
        }

        return () => {
            observer.disconnect();
        };
    });

    $: upcomingList = events.filter((ev) => !getDateMeta(ev.date, $language).isPast);
    $: pastList = events.filter((ev) => getDateMeta(ev.date, $language).isPast);
</script>

<div class="page">
    <!-- STICKY HEADER -->
    <header class="page-header">
        <div class="header-left">
            <Backbtn label={$t.common.back} on:click={navigateBack} />
        </div>
        <h1 class="header-title">{$t.events.allEvents}</h1>
        <div class="header-right">
            <button
                class="header-add-btn"
                on:click={() => activeTab.set("eventCreate")}
                aria-label={$t.events.newEvent}
            >
                <Icon icon="material-symbols:add-rounded" width={22} />
            </button>
        </div>
    </header>

    <div class="page-content">
        {#if loadingInitial}
            <div class="list">
                {#each Array(4) as _}
                    <div class="event-card skeleton-card">
                        <div class="skeleton icon-skeleton"></div>
                        <div class="event-body">
                            <div class="skeleton name-skeleton"></div>
                            <div class="skeleton desc-skeleton"></div>
                        </div>
                        <div class="skeleton badge-skeleton"></div>
                    </div>
                {/each}
            </div>
        {:else if error && !events.length}
            <div class="state-container">
                <span class="state-icon">⚠️</span>
                <span class="state-title">{error}</span>
                <button class="retry-btn" on:click={reload}>
                    {$t.common.retry}
                </button>
            </div>
        {:else if !events.length}
            <div class="state-container">
                <div class="empty-icon-wrap">
                    <Icon icon="material-symbols:calendar-month-outline-rounded" width={48} />
                </div>
                <span class="state-title">{$t.stats.noEvents}</span>
                <span class="state-subtitle">{$t.events.noEventsDesc}</span>
                <button
                    class="create-cta-btn"
                    on:click={() => activeTab.set("eventCreate")}
                >
                    <Icon icon="material-symbols:add-rounded" width={20} />
                    <span>{$t.events.addEvent}</span>
                </button>
            </div>
        {:else}
            <!-- LIST OF EVENTS -->
            <div class="list-container">
                {#if upcomingList.length > 0}
                    <div class="section-badge">
                        <span class="section-title">{$t.events.upcoming}</span>
                        <span class="section-count">{upcomingList.length}</span>
                    </div>

                    <div class="list">
                        {#each upcomingList as event (event.id)}
                            {@const meta = getDateMeta(event.date, $language)}
                            <button
                                class="event-card"
                                on:click={() => (selectedEvent = event)}
                            >
                                <div class="icon-wrap" style="background: {event.icon_bg}">
                                    <Icon
                                        icon={event.icon}
                                        width={24}
                                        color={event.icon_color}
                                    />
                                </div>
                                <div class="event-body">
                                    <span class="event-name">{event.name}</span>
                                    {#if event.description}
                                        <span class="event-desc">{event.description}</span>
                                    {/if}
                                    <span class="event-date-text">{meta.formattedDate}</span>
                                </div>
                                <div class="event-right">
                                    <span class="badge badge-{meta.cls}">{meta.badge}</span>
                                    <Icon
                                        icon="material-symbols:chevron-right-rounded"
                                        width={20}
                                        class="chevron"
                                    />
                                </div>
                            </button>
                        {/each}
                    </div>
                {/if}

                {#if pastList.length > 0}
                    <div class="section-badge section-badge--past">
                        <span class="section-title">{$t.events.past}</span>
                        <span class="section-count">{pastList.length}</span>
                    </div>

                    <div class="list">
                        {#each pastList as event (event.id)}
                            {@const meta = getDateMeta(event.date, $language)}
                            <button
                                class="event-card past-card"
                                on:click={() => (selectedEvent = event)}
                            >
                                <div class="icon-wrap icon-wrap--past" style="background: {event.icon_bg}">
                                    <Icon
                                        icon={event.icon}
                                        width={24}
                                        color={event.icon_color}
                                    />
                                </div>
                                <div class="event-body">
                                    <span class="event-name">{event.name}</span>
                                    {#if event.description}
                                        <span class="event-desc">{event.description}</span>
                                    {/if}
                                    <span class="event-date-text">{meta.formattedDate}</span>
                                </div>
                                <div class="event-right">
                                    <span class="badge badge-{meta.cls}">{meta.badge}</span>
                                    <Icon
                                        icon="material-symbols:chevron-right-rounded"
                                        width={20}
                                        class="chevron"
                                    />
                                </div>
                            </button>
                        {/each}
                    </div>
                {/if}

                <!-- SENTINEL FOR INFINITE SCROLL -->
                <div bind:this={sentinelEl} class="sentinel"></div>

                {#if loadingMore}
                    <div class="loading-more">
                        <div class="spinner"></div>
                        <span>{$t.common.loading}</span>
                    </div>
                {:else if !hasMore && events.length > 5}
                    <div class="end-indicator">
                        <span>{$t.events.allLoaded}</span>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

{#if selectedEvent}
    <EventDetailSheet
        event={selectedEvent}
        on:close={() => (selectedEvent = null)}
        on:delete={handleDelete}
        on:reschedule={handleReschedule}
    />
{/if}

<style>
    .page {
        display: flex;
        flex-direction: column;
        min-height: 100%;
        background-color: var(--bg);
    }

    .page-header {
        position: sticky;
        top: 0;
        z-index: 20;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 12px 16px;
        background: var(--bg-bar);
        border-bottom: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
    }

    .header-left {
        display: flex;
        align-items: center;
        min-width: 70px;
    }

    .header-title {
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        color: var(--text-primary);
        text-align: center;
        letter-spacing: -0.3px;
    }

    .header-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        min-width: 70px;
    }

    .header-add-btn {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 36px;
        height: 36px;

        border-radius: 12px;
        border: none;

        background: color-mix(in srgb, var(--accent) 14%, transparent);
        color: var(--accent);

        cursor: pointer;
        transition: transform 0.15s ease, background 0.15s ease;
    }

    .header-add-btn:active {
        transform: scale(0.92);
        background: color-mix(in srgb, var(--accent) 24%, transparent);
    }

    .page-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 14px 16px max(32px, env(safe-area-inset-bottom));
    }

    .list-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .section-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        padding-left: 2px;
    }

    .section-title {
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: var(--text-secondary);
    }

    .section-badge--past .section-title {
        color: var(--text-muted);
    }

    .section-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        color: var(--accent);
    }

    .section-badge--past .section-count {
        background: color-mix(in srgb, var(--text-muted) 14%, transparent);
        color: var(--text-muted);
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .event-card {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
        padding: 14px;

        background: var(--surface);
        border: 1px solid color-mix(in srgb, var(--border) 45%, transparent);
        border-radius: 20px;
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.03);

        cursor: pointer;
        text-align: left;
        font-family: inherit;

        transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
    }

    .event-card:active {
        transform: scale(0.98);
        background: color-mix(in srgb, var(--accent) 6%, var(--surface));
    }

    .past-card {
        opacity: 0.78;
        background: color-mix(in srgb, var(--surface) 92%, var(--bg));
    }

    .icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 48px;
        height: 48px;
        border-radius: 16px;
        flex-shrink: 0;

        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }

    .icon-wrap--past {
        filter: grayscale(0.25);
    }

    .event-body {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
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
        margin-top: 2px;
    }

    .event-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
    }

    .badge {
        padding: 4px 9px;
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
        opacity: 0.6;
    }

    /* INFINITE SCROLL & LOADING */

    .sentinel {
        height: 20px;
        width: 100%;
    }

    .loading-more {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
    }

    .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid color-mix(in srgb, var(--accent) 25%, transparent);
        border-top-color: var(--accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .end-indicator {
        text-align: center;
        padding: 16px 0;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        opacity: 0.75;
    }

    /* EMPTY & ERROR STATES */

    .state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
        gap: 10px;
    }

    .empty-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        border-radius: 28px;
        background: color-mix(in srgb, var(--accent) 10%, transparent);
        color: var(--accent);
        margin-bottom: 6px;
    }

    .state-title {
        font-size: 17px;
        font-weight: 800;
        color: var(--text-primary);
    }

    .state-subtitle {
        font-size: 13px;
        color: var(--text-muted);
        max-width: 260px;
        line-height: 1.4;
    }

    .create-cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        padding: 12px 20px;
        background: var(--accent);
        color: #ffffff;
        border: none;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent);
        transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .create-cta-btn:active {
        transform: scale(0.96);
        opacity: 0.9;
    }

    .retry-btn {
        margin-top: 8px;
        padding: 8px 18px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        color: var(--accent);
        cursor: pointer;
    }

    /* SKELETONS */

    .skeleton-card {
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

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    @keyframes shimmer {
        from { background-position: 200% 0; }
        to { background-position: -200% 0; }
    }

    .icon-skeleton {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        flex-shrink: 0;
    }

    .name-skeleton {
        width: 140px;
        height: 16px;
        border-radius: 6px;
    }

    .desc-skeleton {
        width: 90px;
        height: 12px;
        border-radius: 4px;
        margin-top: 6px;
    }

    .badge-skeleton {
        width: 60px;
        height: 22px;
        border-radius: 999px;
    }
</style>
