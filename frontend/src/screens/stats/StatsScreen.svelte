<script lang="ts">
    import { useMyProfile } from "$lib/familyStore";
    import { useFamilyStats, useFamilyLeaders } from "$lib/statsStore";
    import { useUpcomingEvents } from "$lib/eventsStore";
    import LeadersCard from "$features/family/LeadersCard.svelte";
    import EventsCard from "$features/family/EventsCard.svelte";
    import CompactUserProfile from "$features/users/UserInfoCard.svelte";
    import { t } from "$lib/i18n";

    // ─── Data fetching ───────────────────────────────────────────────────────────
    const profile = useMyProfile();
    const leaders = useFamilyLeaders();
    const stats = useFamilyStats();
    const familyEvents = useUpcomingEvents();

    // реактивные алиасы
    $: meUser = $profile.data;
    $: weekLeaders = $leaders.data;
    $: events = $familyEvents.data;

    // loading = true только пока нет ни кэша ни ответа
    $: loading = $profile.loading || $leaders.loading || $stats.loading;
</script>

<div class="screen">
    <header class="hub-header">
        <div class="hub-title-row">
            <div class="title-wrap">
                <h1 class="hub-title">{$t.nav.home}</h1>
                <span class="hub-subtitle">{$t.stats.subtitle}</span>
            </div>
        </div>
    </header>

    <!-- FAMILY CARD -->

    <CompactUserProfile
        user={meUser}
        {loading}
        unread={true}
        onNotificationClick={() => console.log("notifications")}
    />
    <EventsCard
        {loading}
        {events}
        onAddClick={() => console.log("открыть форму создания события")}
    />

    <LeadersCard {weekLeaders} {loading} />
</div>

<style>
    .screen {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 12px 16px calc(24px + env(safe-area-inset-bottom));
        box-sizing: border-box;
    }

    .hub-header {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 2px;
        padding: 0 2px;
    }

    .hub-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-wrap {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .hub-title {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.4px;
        color: var(--text-primary);
        line-height: 1.15;
    }

    .hub-subtitle {
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
        font-size: 13.5px;
        color: var(--text-secondary);
        font-weight: 400;
        letter-spacing: -0.1px;
    }
</style>
