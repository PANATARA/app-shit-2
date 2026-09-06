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
    import UserStatsCard from "$features/users/UserStatsCard.svelte";
    import { swr } from "$lib/swr";

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
    <!-- FAMILY CARD -->

    <CompactUserProfile
        user={meUser}
        {loading}
        unread={true}
        onNotificationClick={() => console.log("notifications")}
    />

    <UserStatsCard user={meUser} {loading} />
    <LeadersCard {weekLeaders} {loading} />
    <EventsCard
        {loading}
        {events}
        onAddClick={() => console.log("открыть форму создания события")}
    />
</div>

<style>
    .screen {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 10px;
        min-height: 100vh;
        font-family:
            system-ui,
            -apple-system,
            sans-serif;
    }
</style>
