<script lang="ts">
    import { fade } from "svelte/transition";

    import {
        completePlannedChore,
        getPlannedChore,
        unCompletePlannedChore,
    } from "$api/chores";
    import { swr } from "$lib/swr";
    import { formatDateKey, getFriendlyDate } from "$lib/utils";

    import CardPlannedChore from "$features/chores/CardPlannedChore.svelte";
    import CreatePlannedChore from "$features/chores/CreatePlannedChore.svelte";
    import DetailPlannedChoreModal from "$features/chores/DetailPlannedChoreModal.svelte";

    import CardPlannedChoreSkeleton from "$skeletons/CardPlannedChoreSkeleton.svelte";

    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import ProgressBar from "$ui/ProgressBar.svelte";
    import WeekCalendar from "$ui/WeekCalendar.svelte";

    import type { PlannedChore } from "$types/index";
    import { onDestroy, onMount } from "svelte";

    // ─── State ───────────────────────────────────────────────────────────────────

    let modalOpen = false;
    let detailModalOpen = false;
    let selectedDate = new Date();
    let selectedPlannedChore: PlannedChore | null = null;
    let optimisticChores: PlannedChore[] | null = null;

    $: dateKey = formatDateKey(selectedDate);

    $: chores = swr(`planned-chores:${dateKey}`, () =>
        getPlannedChore({ due_date: dateKey }),
    );

    // Optimistic данные перекрывают данные стора и сбрасываются при смене даты
    $: if (dateKey) optimisticChores = null;

    $: plannedChores = optimisticChores ?? $chores.data ?? [];
    $: loading = $chores.loading;

    // ─── Event handlers ──────────────────────────────────────────────────────────

    function handleDateChange(event: CustomEvent<Date>) {
        selectedDate = event.detail;
    }

    async function toggleChore(choreItem: PlannedChore) {
        const previous = plannedChores;
        const isCompleted = choreItem.completed_by !== null;

        // Optimistic update
        optimisticChores = plannedChores.map((chore) =>
            chore.id === choreItem.id
                ? {
                      ...chore,
                      completed_by: isCompleted ? null : chore.assigned_to,
                  }
                : chore,
        );

        try {
            const updated = isCompleted
                ? await unCompletePlannedChore(choreItem.id)
                : await completePlannedChore(choreItem.id);

            optimisticChores = optimisticChores.map((chore) =>
                chore.id === updated.id ? updated : chore,
            );

            // Обновляем кэш SWR свежими данными
            chores.revalidate();
        } catch (e) {
            optimisticChores = previous;
            console.error(e);
        }
    }

    // ─── Derived state ───────────────────────────────────────────────────────────

    $: currentDueDateStr = formatDateKey(selectedDate);

    $: dateChores = plannedChores.filter(
        (chore) => chore.due_date === currentDueDateStr,
    );

    $: activePlannedChores = dateChores.filter(
        (chore) => chore.completed_by === null,
    );

    $: completedPlannedChores = dateChores.filter(
        (chore) => chore.completed_by !== null,
    );

    $: totalCount = dateChores.length;
    $: completedCount = completedPlannedChores.length;

    $: progressPercentage =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
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
                {totalCount}
                {completedCount}
                {progressPercentage}
                value={getFriendlyDate(selectedDate)}
            />
        </div>

        <ButtonPrimaryGlow
            on:click={() => (modalOpen = true)}
            label={"Добавить задачу"}
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
                                on:click={() => {
                                    selectedPlannedChore = chore;
                                    detailModalOpen = true;
                                }}
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
                                on:click={() => {
                                    selectedPlannedChore = plannedChore;
                                    detailModalOpen = true;
                                }}
                            />
                        {/each}
                    </div>
                </div>
            {/if}
        {/if}

        {#if modalOpen}
            <CreatePlannedChore
                on:close={() => (modalOpen = false)}
                on:add={() => {
                    modalOpen = false;
                    chores.revalidate();
                }}
            />
        {:else if detailModalOpen && selectedPlannedChore}
            <DetailPlannedChoreModal
                plannedChore={selectedPlannedChore}
                on:close={() => (detailModalOpen = false)}
                on:deleted={(e) => {
                    plannedChores = plannedChores.filter(
                        (c) => c.id !== e.detail,
                    );
                }}
                on:updated={(e) => {
                    plannedChores = plannedChores.map((c) =>
                        c.id === e.detail.id ? e.detail : c,
                    );
                }}
            />
        {/if}
    </div>
</div>

<style>
    .screen {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        box-sizing: border-box;
        width: 100%;
        min-height: 100%;
    }

    /* ── CALENDAR CARD ───────────────────────────── */
    .calendar-card {
        background: var(--surface);
        padding: 12px;
        border-radius: 0 0 24px 24px;
        /*border: 1px so/lid var(--border);*/
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: sticky;
        top: 0;
        z-index: 10;
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
