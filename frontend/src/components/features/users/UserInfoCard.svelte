<script lang="ts">
    import UserAvatar from "$ui/UserAvatar.svelte";
    import UserProfileSkeleton from "$skeletons/CompactUserProfile.svelte";
    import ProgressBar from "$ui/ProgressBar.svelte";
    import Card from "$ui/Card.svelte";
    import type { UserProfileStats } from "$types/index";

    export let user: UserProfileStats | null = null;
    export let loading = true;
</script>

{#if loading}
    <UserProfileSkeleton />
{:else}
    <Card glowDirection="top-right">
        <div class="top-row">
            <div class="user">
                <UserAvatar {user} size={52} />
                <div class="user-info">
                    <span class="name">{user.name}</span>
                    <span class="level-badge">Уровень {user.level}</span>
                </div>
            </div>
        </div>

        <div class="xp-row">
            <ProgressBar
                percent={user.progress_percent}
                label="Опыт"
                sublabel="{user.experience} / {user.exp_to_next_total} XP"
                shimmer={true}
            />
        </div>
    </Card>
{/if}

<style>
    .top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;

        position: relative;
        z-index: 1;
    }

    .user {
        display: flex;
        align-items: center;
        gap: 14px;

        min-width: 0;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        gap: 6px;

        min-width: 0;
    }

    .name {
        font-size: 18px;
        font-weight: 800;

        color: var(--text-primary);

        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .level-badge {
        width: fit-content;

        padding: 4px 10px;

        border-radius: 999px;

        background: color-mix(in srgb, var(--accent) 14%, transparent);

        color: var(--accent);

        font-size: 11px;
        font-weight: 700;

        letter-spacing: 0.3px;
    }

    /* XP */

    .xp-row {
        z-index: 1;
    }
</style>
