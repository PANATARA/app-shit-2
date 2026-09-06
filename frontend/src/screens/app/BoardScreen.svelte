<script lang="ts">
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
    import { formatDateKey, getFriendlyDate } from "$lib/utils";
    import CardPlannedChore from "$features/chores/CardPlannedChore.svelte";
    import CardPlannedChoreSkeleton from "$skeletons/CardPlannedChoreSkeleton.svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import ProgressBar from "$ui/ProgressBar.svelte";
    import WeekCalendar from "$ui/WeekCalendar.svelte";
    import { detailPlannedChoreParams, activeTab } from "$lib/navigation";
    import type { AnyPlannedChore, PlannedChore, QuickPlannedChore } from "$types/index";

    // ─── State ───────────────────────────────────────────────────────────────────

    let selectedDate = new Date();
    let optimisticChores: AnyPlannedChore[] | null = null;

    $: dateKey = formatDateKey(selectedDate);

    // Сбрасываем оптимистичные данные при смене даты
    $: if (dateKey) optimisticChores = null;

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
    $: completedCount = completedPlannedChores.length;
    $: progressPercentage = totalCount > 0
        ? Math.round((completedCount / totalCount) * 100)
        : 0;

    // ─── Handlers ────────────────────────────────────────────────────────────────

    function handleDateChange(event: CustomEvent<Date>) {
        selectedDate = event.detail;
    }

    function openDetailScreen(plannedChore: PlannedChore) {
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
    <!-- Progress Bar Header -->
    <div class="calendar-card">
        <div class="week-calendar-section">
            <WeekCalendar {selectedDate} on:change={handleDateChange} />
        </div>

        <div class="prog-bar-section">
            <ProgressBar
                percent={progressPercentage}
                label={getFriendlyDate(selectedDate)}
                sublabel="{completedCount}/{totalCount} задач"
                shimmer={true}
            />
        </div>

        <ButtonPrimaryGlow
            on:click={() => activeTab.set("createPlannedChoreStepOne")}
            label={"Запланировать задачу"}
            fullWidth
        />
    </div>
    <div class="screen">
        <!-- MAIN LIST CONTROLLER -->
        {#if loading}
            <CardPlannedChoreSkeleton count={3} />
        {:else if totalCount === 0}
            <!-- Absolute Zero Empty State -->
            <div class="empty-state perfect-empty" in:fade={{ duration: 200 }}>
                <div class="empty-icon-large">🏕️</div>
                <h3>Планы отсутствуют</h3>
                <p>
                    На этот день пока не запланировано никаких домашних дел.
                    Добавьте задачу с помощью кнопки ниже!
                </p>
            </div>
        {:else}
            <!-- ACTIVE CHORES -->
            <div class="section">
                <div class="section-header">
                    <h2>АКТИВНЫЕ</h2>
                    <span class="section-count"
                        >{activePlannedChores.length}</span
                    >
                </div>

                <div class="list">
                    {#if activePlannedChores.length === 0}
                        <div class="empty-state clean-success">
                            <div class="empty-icon">🎉</div>
                            <h3>Все дела сделаны!</h3>
                            <p>
                                Отличная работа! Все запланированные задачи на
                                сегодня успешно завершены.
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
                        <h2>ВЫПОЛНЕННЫЕ</h2>
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
</div>

<style>
    .page {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .screen {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        box-sizing: border-box;
    }

    /* ── CALENDAR CARD ───────────────────────────── */
    .calendar-card {
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        padding: 16px;
        background: linear-gradient(
            160deg,
            color-mix(in srgb, var(--accent) 12%, var(--surface)) 0%,
            var(--surface) 55%
        );
        border-radius: 0 0 32px 32px;
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 8px 24px rgba(0, 0, 0, 0.08),
            0 20px 40px rgba(0, 0, 0, 0.04);
        z-index: 10;
    }

    /* декоративный свет */
    .calendar-card::before {
        content: "";
        position: absolute;
        width: 260px;
        height: 260px;
        right: -80px;
        top: -120px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--accent) 20%, transparent);
        filter: blur(50px);
        pointer-events: none;
    }

    /* второй свет снизу слева для глубины */
    .calendar-card::after {
        content: "";
        position: absolute;
        width: 160px;
        height: 160px;
        left: -40px;
        bottom: -60px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--accent) 8%, transparent);
        filter: blur(40px);
        pointer-events: none;
    }

    .week-calendar-section {
        position: relative;
        z-index: 1;
    }

    .prog-bar-section {
        position: relative;
        z-index: 1;
        padding-bottom: 10px;
    }

    .calendar-card :global(button) {
        position: relative;
        z-index: 1;
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
        font-size: 12px;
        font-weight: 800;
        color: var(--text-muted);
        letter-spacing: 1.2px;
        margin: 0;
    }

    .section-count {
        font-size: 11px;
        font-weight: 700;
        color: var(--accent);
        background: var(--accent-soft);
        padding: 2px 8px;
        border-radius: 10px;
    }

    .completed-count-badge {
        color: var(--success);
        background: var(--success-soft);
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
        padding: 32px 16px;
        background: var(--surface);
        border: 1.5px dashed var(--border);
        border-radius: 24px;
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
        font-size: 15px;
        font-weight: 700;
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
        padding: 48px 20px;
        margin-top: 10px;
    }
</style>
