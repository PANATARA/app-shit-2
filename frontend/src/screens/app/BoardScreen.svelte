<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import {
        completePlannedChore,
        getPlannedChore,
        unCompletePlannedChore,
        getQuickPlannedChores,
        completeQuickPlannedChore,
        uncompleteQuickPlannedChore,
    } from "$api/chores";
    import { swr } from "$lib/swr";
    import { formatDateKey } from "$lib/utils";
    import CardPlannedChore from "$features/chores/CardPlannedChore.svelte";
    import CardPlannedChoreSkeleton from "$skeletons/CardPlannedChoreSkeleton.svelte";
    import Icon from "@iconify/svelte";
    import WeekCalendar from "$ui/WeekCalendar.svelte";
    import { detailPlannedChoreParams, activeTab } from "$lib/navigation";
    import { t } from "$lib/i18n";
    import { language } from "$lib/settings";
    import type { AnyPlannedChore, PlannedChore, QuickPlannedChore } from "$types/index";

    // ─── State ───────────────────────────────────────────────────────────────────

    let selectedDate = new Date();
    let optimisticChores: AnyPlannedChore[] | null = null;
    let screenEl: HTMLElement;
    let isScrolled = false;

    $: dateKey = formatDateKey(selectedDate);

    // Сбрасываем оптимистичные данные при смене даты
    $: if (dateKey) optimisticChores = null;

    function handleScroll(e: any = null) {
        const target = (e?.currentTarget as HTMLElement) || (e?.target as HTMLElement) || screenEl;
        const currentScroll = target ? target.scrollTop : 0;

        if (currentScroll > 30) {
            if (!isScrolled) isScrolled = true;
        } else if (currentScroll <= 10) {
            if (isScrolled) isScrolled = false;
        }
    }

    onMount(() => {
        const parentContent = screenEl?.closest(".content");
        const onParentScroll = (e: Event) => handleScroll(e);
        if (parentContent) {
            parentContent.addEventListener("scroll", onParentScroll, { passive: true });
        }
        return () => {
            if (parentContent) {
                parentContent.removeEventListener("scroll", onParentScroll);
            }
        };
    });

    // ─── Data fetching ────────────────────────────────────────────────────────────

    $: chores = swr<PlannedChore[]>(
        `planned-chores:${dateKey}`,
        () => getPlannedChore({ due_date: dateKey }),
    );

    $: quickChores = swr<QuickPlannedChore[]>(
        `quick-planned-chores:${dateKey}`,
        () => getQuickPlannedChores(dateKey, dateKey),
    );

    $: loading = $chores.loading || $quickChores.loading;

    // ─── Merged & sorted chores ───────────────────────────────────────────────────

    $: allChores = [
        ...($chores.data ?? []).map(c => ({ ...c, is_quick: false as const })),
        ...($quickChores.data ?? []).map(c => ({ ...c, is_quick: true as const })),
    ].sort((a, b) => Number(a.is_quick) - Number(b.is_quick));

    $: plannedChores = optimisticChores ?? allChores;

    // ─── Derived state ────────────────────────────────────────────────────────────

    $: activePlannedChores = plannedChores.filter(c => c.completed_by === null);
    $: completedPlannedChores = plannedChores.filter(c => c.completed_by !== null);
    $: totalCount = plannedChores.length;

    // ─── Handlers ────────────────────────────────────────────────────────────────

    function handleDateChange(event: CustomEvent<Date>) {
        selectedDate = event.detail;
        if (screenEl) {
            screenEl.scrollTop = 0;
        }
        isScrolled = false;
    }

    function openDetailScreen(plannedChore: AnyPlannedChore) {
        detailPlannedChoreParams.set({ plannedChore });
        activeTab.set("DetailPlannedChore");
    }

    async function toggleChore(choreItem: AnyPlannedChore) {
        const previous = plannedChores;
        const isCompleted = choreItem.completed_by !== null;

        // Оптимистичное обновление
        optimisticChores = plannedChores.map(chore =>
            chore.id === choreItem.id
                ? { ...chore, completed_by: isCompleted ? null : chore.assigned_to }
                : chore,
        );

        try {
            let updated: AnyPlannedChore;

            if (choreItem.is_quick) {
                const raw = isCompleted
                    ? await uncompleteQuickPlannedChore(choreItem.id)
                    : await completeQuickPlannedChore(choreItem.id);
                updated = { ...raw, is_quick: true as const };
                await quickChores.revalidate(); // Добавлен await
            } else {
                const raw = isCompleted
                    ? await unCompletePlannedChore(choreItem.id)
                    : await completePlannedChore(choreItem.id);
                updated = { ...raw, is_quick: false as const };
                await chores.revalidate(); // Добавлен await
            }

            // Как только сервер вернул актуальные данные и SWR обновил кэш,
            // сбрасываем ручной стейт, чтобы UI переключился на allChores
            optimisticChores = null;
        } catch (e) {
            optimisticChores = previous;
            console.error(e);
        }
    }
</script>

<!-- Calendar Widget -->

<div class="page">
    <!-- Compact Calendar Header -->
    <div class="calendar-card">
        <header class="hub-header">
            <div class="hub-title-row">
                <div class="title-wrap">
                    <h1 class="hub-title">{$t.nav.board}</h1>
                    <span class="hub-subtitle">{$t.board.subtitle}</span>
                </div>
            </div>
        </header>

        <div class="week-calendar-section">
            <WeekCalendar {selectedDate} on:change={handleDateChange} />
        </div>
    </div>
    <div class="screen" bind:this={screenEl} on:scroll={handleScroll}>
        <!-- MAIN LIST CONTROLLER -->
        {#if loading}
            <CardPlannedChoreSkeleton count={3} />
        {:else if totalCount === 0}
            <!-- Absolute Zero Empty State -->
            <div class="empty-state perfect-empty" in:fade={{ duration: 200 }}>
                <div class="empty-icon-large">🏕️</div>
                <h3>{$t.board.noChoresTitle}</h3>
                <p>
                    {$t.board.noChoresDesc}
                </p>
            </div>
        {:else}
            <!-- ACTIVE CHORES -->
            <div class="section">
                <div class="section-header">
                    <h2>{$t.board.active.toUpperCase()}</h2>
                    <span class="section-count"
                        >{activePlannedChores.length}</span
                    >
                </div>

                <div class="list">
                    {#if activePlannedChores.length === 0}
                        <div class="empty-state clean-success">
                            <div class="empty-icon">🎉</div>
                            <h3>{$t.board.allDoneTitle}</h3>
                            <p>
                                {$t.board.allDoneDesc}
                            </p>
                        </div>
                    {:else}
                        {#each activePlannedChores as chore (chore.id)}
                            <CardPlannedChore
                                item={chore}
                                onToggle={toggleChore}
                                onClick={() => openDetailScreen(chore)}
                            />
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- COMPLETED CHORES -->
            {#if completedPlannedChores.length > 0}
                <div class="section">
                    <div class="section-header">
                        <h2>{$t.board.completed.toUpperCase()}</h2>
                        <span class="section-count completed-count-badge">
                            {completedPlannedChores.length}
                        </span>
                    </div>

                    <div class="list">
                        {#each completedPlannedChores as plannedChore (plannedChore.id)}
                            <CardPlannedChore
                                item={plannedChore}
                                onToggle={toggleChore}
                                onClick={() => openDetailScreen(plannedChore)}
                            />
                        {/each}
                    </div>
                </div>
            {/if}
        {/if}
    </div>

    <!-- Floating Action Button (FAB) -->
    <button
        class="fab-plan"
        class:compact={isScrolled}
        on:click={() => activeTab.set("createPlannedChoreStepOne")}
        aria-label={$t.board.planChore}
    >
        <div class="fab-icon">
            <Icon icon="material-symbols:add-rounded" width="26" height="26" />
        </div>
        <span class="fab-label">{$t.board.planChore}</span>
    </button>
</div>

<style>
    .page {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
    }
    .screen {
        flex: 1;
        overflow-y: auto;
        padding: 12px 12px 96px 12px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        box-sizing: border-box;
    }

    /* ── COMPACT CALENDAR CARD ───────────────────── */
    .calendar-card {
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 14px 14px;
        background: var(--surface);
        border-bottom: 1px solid var(--border-subtle);
        border-radius: 0 0 var(--radius-modal, 28px) var(--radius-modal, 28px);
        box-shadow: var(--shadow-ambient);
        z-index: 10;
    }

    .hub-header {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 2px;
    }

    .hub-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .title-wrap {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .hub-title {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
        margin: 0;
        color: var(--text-primary);
    }

    .hub-subtitle {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-muted);
    }

    .week-calendar-section {
        position: relative;
        z-index: 1;
    }


    /* ── FLOATING ACTION BUTTON (FAB) ────────────── */
    .fab-plan {
        position: fixed;
        left: 50%;
        bottom: calc(100px + env(safe-area-inset-bottom));
        transform: translateX(-50%) translateZ(0);
        z-index: 95;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 54px;

        /* Базовые размеры */
        min-width: 54px;
        max-width: 260px;
        overflow: hidden;

        box-sizing: border-box;
        gap: 8px;
        padding: 0 24px;
        border-radius: 999px;
        border: none;
        background: var(--accent-gradient, linear-gradient(
            135deg,
            var(--accent) 0%,
            color-mix(in srgb, var(--accent) 88%, #000) 100%
        ));
        color: #ffffff;

        box-shadow: var(--shadow-floating);

        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        will-change: max-width, padding, gap, transform;

        transition:
            max-width 0.44s cubic-bezier(0.16, 1, 0.3, 1),
            padding 0.44s cubic-bezier(0.16, 1, 0.3, 1),
            gap 0.44s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .fab-plan:active {
        transform: translateX(-50%) scale(0.94) translateZ(0);
        box-shadow:
            0 4px 14px color-mix(in srgb, var(--accent) 26%, transparent),
            0 1px 3px rgba(0, 0, 0, 0.1);

        transition:
            transform 0.14s cubic-bezier(0.25, 1, 0.5, 1),
            box-shadow 0.14s cubic-bezier(0.25, 1, 0.5, 1);
    }

    /* Иконка жестко зафиксирована по центру */
    .fab-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 24px;
        height: 24px;
    }

    .fab-label {
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: -0.2px;
        white-space: nowrap;

        /* Ограничиваем лейбл, чтобы он плавно схлопывался */
        max-width: 180px;
        opacity: 1;
        transform: translate3d(0, 0, 0);
        overflow: hidden;
        will-change: max-width, opacity, transform;

        transition:
            max-width 0.44s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.44s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* ── Свернутое состояние (круг 54x54 с иконкой по центру) ── */
    .fab-plan.compact {
        max-width: 54px;
        padding: 0;
        gap: 0;

        transition:
            max-width 0.38s cubic-bezier(0.32, 0.72, 0, 1),
            padding 0.38s cubic-bezier(0.32, 0.72, 0, 1),
            gap 0.38s cubic-bezier(0.32, 0.72, 0, 1),
            transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .fab-plan.compact .fab-label {
        /* Лейбл полностью убирает ширину и освобождает место для плюсика */
        max-width: 0;
        opacity: 0;
        transform: translate3d(-8px, 0, 0);
        pointer-events: none;

        transition:
            max-width 0.38s cubic-bezier(0.32, 0.72, 0, 1),
            opacity 0.16s ease-out,
            transform 0.38s cubic-bezier(0.32, 0.72, 0, 1);
    }

    /* ── SECTION HEADERS ─────────────────────────── */
    .section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-left: 4px;
    }

    h2 {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin: 0;
    }

    .section-count {
        font-size: 11px;
        font-weight: 700;
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 14%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
        padding: 1px 8px;
        border-radius: 999px;
    }

    .completed-count-badge {
        color: var(--success);
        background: color-mix(in srgb, var(--success) 14%, transparent);
        border: 1px solid color-mix(in srgb, var(--success) 24%, transparent);
    }

    /* ── LISTS ───────────────────────────────────── */
    .list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    /* ── EMPTY STATES ─────────────────────────────── */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 20px;
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-card, 22px);
        box-shadow: var(--shadow-card);
        text-align: center;
        box-sizing: border-box;
    }

    .empty-icon {
        font-size: 32px;
        margin-bottom: 10px;
    }

    .empty-icon-large {
        font-size: 42px;
        margin-bottom: 12px;
    }

    .empty-state h3 {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.3px;
        color: var(--text-primary);
        margin: 0 0 6px 0;
    }

    .empty-state p {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0;
        max-width: 260px;
        line-height: 1.45;
    }

    .perfect-empty {
        padding: 48px 24px;
        margin-top: 6px;
    }
</style>
