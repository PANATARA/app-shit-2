<script lang="ts">
    import type { FamilyStatsProfile } from "$types/index";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import Icon from "@iconify/svelte";
    import FamilyStatsCardSkeleton from "$skeletons/FamilyStatsCardSkeleton.svelte";

    // ─── STATE MACHINE ─────────────────────────────
    export let loading = true;
    export let familyProfile: FamilyStatsProfile | null = null;

</script>

{#if loading}
    <FamilyStatsCardSkeleton />
{:else}
    <div class="family-card">
        <div class="header">
            <UserAvatar user={familyProfile} size={64} />

            <div class="header-info">
                <div class="family-tag">СЕМЕЙНЫЙ КРУГ</div>
                <div class="family-name">{familyProfile.name}</div>
                <div class="members">
                    <Icon
                        icon="material-symbols:group-rounded"
                        width="16"
                        height="16"
                    />
                    {familyProfile.members_count} участников
                </div>
            </div>
        </div>

        <div class="hero-stat">
            <div class="hero-label">
                <Icon
                    icon="material-symbols:emoji-events-rounded"
                    width="18"
                    height="18"
                />
                Всего выполнено
            </div>

            <div class="hero-value">
                {familyProfile.total_completed.toLocaleString("ru-RU")}
            </div>

            <div class="hero-subtitles">домашних дел</div>
        </div>

        <div class="stats-grid">
            <div class="mini-card">
                <Icon
                    icon="material-symbols:bolt-rounded"
                    width="22"
                    height="22"
                />

                <div class="mini-value">{familyProfile.week_completed}</div>
                <div class="mini-label">за неделю</div>
            </div>

            <div class="mini-card">
                <Icon
                    icon="material-symbols:local-fire-department-rounded"
                    width="22"
                    height="22"
                />

                <div class="mini-value">{familyProfile.streak}</div>
                <div class="mini-label">дней подряд</div>
            </div>

            <div class="mini-card">
                <Icon
                    icon="material-symbols:auto-awesome-rounded"
                    width="22"
                    height="22"
                />

                <div class="mini-value">{familyProfile.experience}</div>
                <div class="mini-label">опыт семьи</div>
            </div>
        </div>
    </div>
{/if}

<style>
    .family-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .header-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    }

    .family-tag {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: var(--text-muted);
    }

    .family-name {
        font-size: 24px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.1;
    }

    .members {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
    }

    .hero-stat {
        background: var(--surface-alt);
        border-radius: 16px;
        padding: 14px 16px;
        border: 1px solid var(--border);
    }

    .hero-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;

        font-size: 13px;
        font-weight: 700;

        color: var(--accent);
    }

    .hero-value {
        margin-top: 4px;
        font-size: 32px; /* было 42 */
        font-weight: 900;
        line-height: 1;

        color: var(--text-primary);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }

    .mini-card {
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 16px;

        padding: 14px 10px;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;

        text-align: center;
    }

    .mini-card :global(svg) {
        color: var(--accent);
    }

    .mini-value {
        font-size: 22px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
    }

    .mini-label {
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.2;
    }
</style>
