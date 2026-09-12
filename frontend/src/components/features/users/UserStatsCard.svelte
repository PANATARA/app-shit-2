<script lang="ts">
    import type { UserProfileStats } from "$types/index";

    // UserStatsCard has been merged directly into UserInfoCard.svelte
    export let user: UserProfileStats | null = null;
    export let loading: boolean = false;
</script>
