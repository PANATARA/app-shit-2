<script lang="ts">
    import Block from "$ui/block.svelte";
    import { getFamilyStats, getFamilyLeader } from "$api/family";
    import { getProfile } from "$api/me";
    import LeadersCard from "$features/stats/LeadersCard.svelte";
    import FamilyCard from "$features/stats/FamilyCard.svelte";
    import UserProfileCard from "$features/common/UserProfileCard.svelte";
    import { swr } from "$lib/swr";

    // ─── Data fetching ───────────────────────────────────────────────────────────
    const profile = swr("profile", getProfile);
    const leaders = swr("family-leaders", getFamilyLeader);
    const stats = swr("family-stats", getFamilyStats);

    // реактивные алиасы
    $: meUser = $profile.data;
    $: weekLeaders = $leaders.data;
    $: familyProfile = $stats.data;

    // loading = true только пока нет ни кэша ни ответа
    $: loading = $profile.loading || $leaders.loading || $stats.loading;

    // тихая фоновая перезагрузка — можно показать спиннер в углу
    $: revalidating =
        $profile.revalidating || $leaders.revalidating || $stats.revalidating;
</script>

<div class="screen">
    <!-- FAMILY CARD -->

    <Block padding={10}>
        <UserProfileCard user={meUser} {loading} />
    </Block>

    <!-- <Block padding={10}>
        <FamilyCard {familyProfile} {loading} />
    </Block> -->

    <!-- LEADERBOARD -->
    <Block padding={10}>
        <LeadersCard {weekLeaders} {loading} />
    </Block>
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
