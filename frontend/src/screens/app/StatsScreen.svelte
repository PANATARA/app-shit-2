<script lang="ts">
    import {
        getFamilyStats,
        getFamilyLeader,
        getUpcomingEvents,
    } from "$api/family";
    import { getProfile } from "$api/me";
    import LeadersCard from "$features/family/LeadersCard.svelte";
    import EventsCard from "$features/family/EventsCard.svelte";
    import CompactUserProfile from "$features/users/UserInfoCard.svelte";
    import { swr } from "$lib/swr";
    import { t } from "$lib/i18n";

    // ─── Data fetching ───────────────────────────────────────────────────────────
    const profile = swr("profile", getProfile);
    const leaders = swr("family-leaders", getFamilyLeader);
    const stats = swr("family-stats", getFamilyStats);
    const familyEvents = swr("family-events", getUpcomingEvents);

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
                <span class="hub-subtitle">Семейный очаг, дела и события</span>
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
        gap: 14px;
        padding: 12px 14px 24px;
        box-sizing: border-box;
    }

    .hub-header {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-bottom: 2px;
    }

    .hub-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-wrap {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .hub-title {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: var(--text-primary);
        line-height: 1.1;
    }

    .hub-subtitle {
        font-size: 13px;
        color: var(--text-muted);
        font-weight: 500;
    }
</style>
