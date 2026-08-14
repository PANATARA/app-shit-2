<script lang="ts">
    import Icon from "@iconify/svelte";
    import type { UserProfileStats } from "$types/index";
    import UserProfileSkeleton from "$skeletons/UserProfileSkeleton.svelte";

    export let user: UserProfileStats;
    export let loading = true;
</script>

<div class="content">
    {#if loading}
        <UserProfileSkeleton />
    {:else}
        <!-- Hero -->
        <div class="hero-stat">
            <div class="hero-glow"></div>

            <div class="hero-left">
                <div>
                    <div class="hero-value">{user.total_completed}</div>
                    <div class="hero-label">домашних дел ты выполнил за всё время</div>
                </div>
            </div>
        </div>

        <!-- Grid -->
        <div class="stats-grid">
            <div class="mini-card">
                <div class="mini-icon bolt">
                    <Icon icon="material-symbols:bolt-rounded" width="20" height="20" />
                </div>
                <div class="mini-value">{user.week_completed}</div>
                <div class="mini-label">За неделю</div>
            </div>

            <div class="mini-card">
                <div class="mini-icon fire">
                    <Icon icon="material-symbols:local-fire-department-rounded" width="20" height="20" />
                </div>
                <div class="mini-value">{user.streak}</div>
                <div class="mini-label">Дней подряд</div>
            </div>

            <div class="mini-card">
                <div class="mini-icon magic">
                    <Icon icon="material-symbols:auto-awesome-rounded" width="20" height="20" />
                </div>
                <div class="mini-value">{user.experience}</div>
                <div class="mini-label">Твой опыт</div>
            </div>
        </div>
    {/if}
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    /* ── HERO ────────────────────────────────────── */
    .hero-stat {
        position: relative;
        overflow: hidden;
        padding: 20px;
        border-radius: 24px;
        background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--accent) 18%, var(--surface)) 0%,
            var(--surface) 60%
        );
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 2px 4px rgba(0, 0, 0, 0.04),
            0 8px 16px rgba(0, 0, 0, 0.06);
    }

    .hero-glow {
        position: absolute;
        right: -40px;
        top: -40px;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--accent) 22%, transparent);
        filter: blur(32px);
        pointer-events: none;
    }

    .hero-left {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .hero-icon {
        width: 52px;
        height: 52px;
        flex-shrink: 0;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        color: var(--accent);
    }

    .hero-value {
        font-size: 42px;
        font-weight: 900;
        line-height: 1;
        color: var(--text-primary);
        letter-spacing: -1px;
    }

    .hero-label {
        margin-top: 4px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-muted);
    }

    /* ── GRID ────────────────────────────────────── */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }

    .mini-card {
        padding: 16px 10px;
        border-radius: 20px;
        background: var(--surface);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        transition: transform 0.15s ease;
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 2px 4px rgba(0, 0, 0, 0.04),
            0 8px 16px rgba(0, 0, 0, 0.06);
    }

    .mini-card:active {
        transform: scale(0.96);
    }

    .mini-icon {
        width: 40px;
        height: 40px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .bolt {
        background: rgba(255, 196, 0, 0.12);
        color: #ffbf36;
    }

    .fire {
        background: rgba(255, 107, 107, 0.12);
        color: #ff6b6b;
    }

    .magic {
        background: rgba(104, 182, 255, 0.12);
        color: #68b6ff;
    }

    .mini-value {
        font-size: 26px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
        letter-spacing: -0.5px;
    }

    .mini-label {
        text-align: center;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        line-height: 1.3;
    }
</style>
