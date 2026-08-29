<script lang="ts">
    import { getFamilyStats, getFamilyLeader } from "$api/family";
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

    // реактивные алиасы
    $: meUser = $profile.data;
    $: weekLeaders = $leaders.data;

    // loading = true только пока нет ни кэша ни ответа
    $: loading = $profile.loading || $leaders.loading || $stats.loading;

    const mockEvents = [
        {
            id: "1",
            name: "Аквапарк",
            description: "Едем всей семьёй, не забыть полотенца",
            icon: "material-symbols:pool-rounded",
            icon_color: "#0ea5e9",
            icon_bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
            date: new Date(Date.now() + 2 * 86400000)
                .toISOString()
                .split("T")[0],
        },
        {
            id: "2",
            name: "День рождения Мамы",
            description: "Торт и подарок — не забыть!",
            icon: "material-symbols:cake-rounded",
            icon_color: "#f472b6",
            icon_bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
            date: new Date(Date.now() + 6 * 86400000)
                .toISOString()
                .split("T")[0],
        },
        {
            id: "3",
            name: "Поход в лес",
            description: "Берём палатки, выезд в 7 утра",
            icon: "material-symbols:forest-rounded",
            icon_color: "#22c55e",
            icon_bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            date: new Date(Date.now() + 19 * 86400000)
                .toISOString()
                .split("T")[0],
        },
    ];
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
        events={mockEvents}
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
