<script lang="ts">
    import type { FamilyStatsProfile } from "$types/index";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import Icon from "@iconify/svelte";
    import FamilyStatsCardSkeleton from "$skeletons/FamilyStatsCardSkeleton.svelte";

    export let loading = true;
    export let familyProfile: FamilyStatsProfile | null = null;
    export let favoriteChore: string | null = null;
    export let favoriteChoreIcon: string = "material-symbols:flatware-rounded";
    export let favoriteChoreCount: number = 0;

    $: name = familyProfile?.name ?? "Наша Семья";
    $: members_count = familyProfile?.members_count ?? 3;
    $: total_completed = familyProfile?.total_completed ?? 342;
    $: week_completed = familyProfile?.week_completed ?? 18;
    $: streak = familyProfile?.streak ?? 5;
    $: experience = familyProfile?.experience ?? 2750;

    // Квадратичная кривая: уровень N требует 100 * N² XP суммарно
    function getLevelFromXp(xp: number): number {
        return Math.floor((-1 + Math.sqrt(1 + xp / 50)) ) + 1;
    }
    function getXpForLevel(level: number): number {
        return 100 * level * level;
    }

    $: level = getLevelFromXp(experience);
    $: xpForCurrentLevel = getXpForLevel(level - 1);
    $: xpForNextLevel = getXpForLevel(level);
    $: currentXp = experience - xpForCurrentLevel;
    $: nextLevelXp = xpForNextLevel - xpForCurrentLevel;
    $: xpPercentage = Math.min((currentXp / nextLevelXp) * 100, 100);

    function pluralMembers(n: number): string {
        if (n === 1) return "участник";
        if (n >= 2 && n <= 4) return "участника";
        return "участников";
    }
    function pluralDays(n: number): string {
        if (n === 1) return "день";
        if (n >= 2 && n <= 4) return "дня";
        return "дней";
    }
</script>

{#if loading}
    <FamilyStatsCardSkeleton />
{:else}
    <div class="family-card-container">
        <!-- HEADER -->
        <div class="card-header">
            <div class="avatar-wrapper">
                <UserAvatar user={familyProfile} size={68} />
                <div class="level-badge-overlay">
                    <span>{level}</span>
                </div>
            </div>

            <div class="header-details">
                <div class="family-tag-badge">Семейный союз</div>
                <h2 class="family-name-text">{name}</h2>
                <div class="members-badge">
                    <Icon icon="material-symbols:group-rounded" width="16" height="16" />
                    <span>{members_count} {pluralMembers(members_count)}</span>
                </div>
            </div>
        </div>

        <!-- XP -->
        <div class="experience-section">
            <div class="xp-header">
                <div class="xp-title">
                    <Icon icon="material-symbols:auto-awesome-rounded" width="16" height="16" />
                    <span>Опыт семейного круга</span>
                </div>
                <div class="xp-value">
                    <span class="current-xp">{currentXp}</span>
                    <span class="slash">/</span>
                    <span class="total-xp">{nextLevelXp} XP</span>
                </div>
            </div>

            <div class="progress-track">
                <div class="progress-bar-fill" style="width: {xpPercentage}%">
                    <div class="progress-glow"></div>
                </div>
            </div>

            <div class="xp-footer">
                <span class="xp-level-text">Уровень {level}</span>
                <span class="xp-remaining-text">До {level + 1} уровня: {nextLevelXp - currentXp} XP</span>
            </div>
        </div>

        <!-- STATS GRID -->
        <div class="stats-dashboard-grid">
            <div class="metric-card highlight-card">
                <div class="metric-icon-box total-box">
                    <Icon icon="material-symbols:emoji-events-rounded" width="24" height="24" />
                </div>
                <div class="metric-info">
                    <span class="metric-title">Всего выполнено</span>
                    <span class="metric-value-large">{total_completed.toLocaleString("ru-RU")}</span>
                    <span class="metric-subtitle">чистых дел в круге</span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon-box week-box">
                    <Icon icon="material-symbols:bolt-rounded" width="22" height="22" />
                </div>
                <div class="metric-info">
                    <span class="metric-title">За неделю</span>
                    <span class="metric-value-medium">+{week_completed}</span>
                    <span class="metric-subtitle">дел завершено</span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon-box streak-box" class:hot={streak > 0}>
                    <Icon icon="material-symbols:local-fire-department-rounded" width="22" height="22" />
                </div>
                <div class="metric-info">
                    <span class="metric-title">Дней подряд</span>
                    <span class="metric-value-medium">{streak} {pluralDays(streak)}</span>
                    <span class="metric-subtitle">активность</span>
                </div>
            </div>
        </div>

        <!-- FAVORITE CHORE -->
        {#if favoriteChore}
            <div class="favorite-chore-card">
                <div class="fav-icon-container">
                    <Icon icon={favoriteChoreIcon} width={26} height={26} />
                </div>
                <div class="fav-details">
                    <span class="fav-badge">Любимое дело семьи</span>
                    <span class="fav-name">{favoriteChore}</span>
                </div>
                {#if favoriteChoreCount > 0}
                    <div class="fav-count-badge">
                        <span class="fav-count">{favoriteChoreCount}</span>
                        <span class="fav-count-label">раз</span>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
{/if}

<style>
    .family-card-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 6px;
    }

    /* HEADER */
    .card-header {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .avatar-wrapper {
        position: relative;
        flex-shrink: 0;
        width: 68px;
        height: 68px;
    }

    .level-badge-overlay {
        position: absolute;
        bottom: -3px;
        right: -3px;
        background: linear-gradient(135deg, #ffd700, #ff8c00);
        border: 2px solid var(--surface);
        color: #fff;
        font-size: 11px;
        font-weight: 850;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        z-index: 2;
    }

    .header-details {
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1;
        min-width: 0;
    }

    .family-tag-badge {
        font-size: 10px;
        font-weight: 850;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        background: rgba(232, 168, 124, 0.12);
        color: var(--accent);
        padding: 3px 8px;
        border-radius: 6px;
        display: inline-block;
        align-self: flex-start;
    }

    .family-name-text {
        font-size: 22px;
        font-weight: 850;
        color: var(--text-primary);
        line-height: 1.15;
        margin: 0;
        letter-spacing: -0.3px;
        word-break: break-word;
    }

    .members-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
    }

    .members-badge :global(svg) {
        color: var(--text-muted);
    }

    /* XP */
    .experience-section {
        background: var(--surface-alt);
        border: 1px solid var(--border);
        padding: 14px 16px;
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .xp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .xp-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        color: var(--text-secondary);
    }

    .xp-title :global(svg) { color: var(--accent); }

    .xp-value { font-size: 13px; font-weight: 800; }
    .current-xp { color: var(--accent); }
    .slash { color: var(--text-muted); margin: 0 1px; }
    .total-xp { color: var(--text-secondary); }

    .progress-track {
        height: 10px;
        background: rgba(0, 0, 0, 0.12);
        border-radius: 6px;
        overflow: hidden;
    }

    .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent) 0%, #ffd700 100%);
        border-radius: 6px;
        position: relative;
        transition: width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
    }

    .progress-glow {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
        animation: sweep 4s infinite ease-in-out;
    }

    .xp-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .xp-level-text {
        font-size: 11px;
        font-weight: 850;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .xp-remaining-text {
        font-size: 11px;
        font-weight: 500;
        color: var(--text-muted);
    }

    /* STATS GRID */
    .stats-dashboard-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    .metric-card {
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .metric-card:active {
        transform: scale(0.98);
    }

    .highlight-card {
        grid-column: span 2;
        background: linear-gradient(135deg, var(--surface-alt) 0%, rgba(232, 168, 124, 0.05) 100%);
        border-color: rgba(232, 168, 124, 0.25);
        padding: 16px;
    }

    .metric-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .total-box { background: rgba(255, 215, 0, 0.12); color: #ffd700; }
    .week-box  { background: rgba(100, 149, 237, 0.12); color: #6495ed; }

    .streak-box {
        background: rgba(128, 128, 128, 0.08);
        color: var(--text-muted);
        transition: background 0.3s ease, color 0.3s ease;
    }

    .streak-box.hot {
        background: rgba(255, 69, 0, 0.12);
        color: #ff4500;
        animation: pulse-fire 2.5s infinite ease-in-out;
    }

    .metric-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
    }

    .metric-title {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .metric-value-large {
        font-size: 28px;
        font-weight: 900;
        color: var(--text-primary);
        line-height: 1.1;
        letter-spacing: -0.5px;
    }

    .metric-value-medium {
        font-size: 20px;
        font-weight: 850;
        color: var(--text-primary);
        line-height: 1.15;
    }

    .metric-subtitle {
        font-size: 11px;
        font-weight: 500;
        color: var(--text-muted);
    }

    /* FAVORITE CHORE */
    .favorite-chore-card {
        display: flex;
        align-items: center;
        gap: 14px;
        background: linear-gradient(90deg, rgba(232, 168, 124, 0.06) 0%, var(--surface-alt) 100%);
        border: 1px solid rgba(232, 168, 124, 0.2);
        border-radius: 18px;
        padding: 14px 16px;
        transition: transform 0.2s ease, border-color 0.2s ease;
        overflow: hidden;
    }

    .favorite-chore-card:active {
        transform: scale(0.99);
    }

    .fav-icon-container {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: rgba(232, 168, 124, 0.12);
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .fav-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
    }

    .fav-badge {
        font-size: 9px;
        font-weight: 850;
        color: var(--accent);
        letter-spacing: 1px;
        text-transform: uppercase;
    }

    .fav-name {
        font-size: 15px;
        font-weight: 800;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .fav-count-badge {
        background: var(--surface);
        border: 1px solid var(--border);
        padding: 5px 10px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 42px;
        flex-shrink: 0;
    }

    .fav-count {
        font-size: 15px;
        font-weight: 900;
        color: var(--accent);
        line-height: 1;
    }

    .fav-count-label {
        font-size: 9px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        margin-top: 1px;
    }

    /* ANIMATIONS */
    @keyframes sweep {
        0%   { transform: translateX(-100%); }
        60%  { transform: translateX(200%); }
        100% { transform: translateX(200%); }
    }

    @keyframes pulse-fire {
        0%, 100% { box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.0); }
        50%       { box-shadow: 0 0 0 4px rgba(255, 69, 0, 0.15); }
    }
</style>
