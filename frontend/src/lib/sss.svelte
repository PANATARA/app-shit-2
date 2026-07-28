<script lang="ts">
    import Block from "$ui/block.svelte";
    import { onMount } from "svelte";
    import { getFamilyStats, getFamilyLeader } from "$api/family";
    import { getProfile } from "$api/me";
    import type {
        WeeklyLeadersResponse,
        UserProfile,
        FamilyStatsProfile,
    } from "$types/index";
    import LeadersCard from "$features/stats/LeadersCard.svelte";
    import FamilyCard from "$features/stats/FamilyCard.svelte";
    import { swr } from "$lib/swr";

    // ─── STATE MACHINE ─────────────────────────────
    // let loading = true;
    // let error = false;

    // let meUser: UserProfile | null = null;
    // let weekLeaders: WeeklyLeadersResponse | null = null;
    // let familyProfile: FamilyStatsProfile | null = null;

    // onMount(() => {
    //     loadData();
    // });

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

    // async function loadData() {
    //     loading = true;
    //     try {
    //         const [profile, members, family] = await Promise.all([
    //             getProfile(),
    //             getFamilyLeader(),
    //             getFamilyStats(),
    //         ]);
    //         meUser = profile;
    //         weekLeaders = members;
    //         familyProfile = family;
    //     } catch (e) {
    //         console.error("Failed to load planned chores:", e);
    //     } finally {
    //         loading = false;
    //     }
    // }
</script>

<div class="screen">
    <!-- FAMILY CARD -->

    <Block padding={10}>
        <FamilyCard {familyProfile} {loading} />
    </Block>

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
        padding: 12px;
        min-height: 100vh;
        font-family:
            system-ui,
            -apple-system,
            sans-serif;
    }
</style>
