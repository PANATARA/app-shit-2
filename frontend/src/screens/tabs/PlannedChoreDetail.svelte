<script lang="ts">
    // ─── Imports ─────────────────────────────────────────────────────────────
    import Icon from "@iconify/svelte";

    // UI Components
    import UserAvatar from "$ui/UserAvatar.svelte";
    import ChoreIcon from "$ui/ChoreIcon.svelte";
    import RepeatSelector from "$features/chores/RepeatSelector.svelte";
    import PlannedChoreSubtasks from "$features/chores/PlannedChoreSubtasks.svelte";
    import SubtaskEditor from "$features/chores/SubtaskEditor.svelte";

    // API Services
    import {
        deletePlannedChore,
        reschedulePlannedChore,
        completePlannedChore,
        unCompletePlannedChore,
        getChoreSchedule,
        createChoreSchedule,
        updateChoreSchedule,
        deleteChoreSchedule,
        updatePlannedChoreMessage,
    } from "$api/chores";
    import { userSession } from "$api/client";

    // Navigation & Localization
    import { detailPlannedChoreParams, activeTab } from "$lib/navigation";
    import { t } from "$lib/i18n";
    import { language } from "$lib/settings";

    // ─── Types & Interfaces ──────────────────────────────────────────────────
    type FrequencyType = "none" | "daily" | "weekly" | "monthly";

    interface RepeatConfig {
        frequency_type: FrequencyType;
        interval: number;
        days_of_week: number[];
        day_of_month: number | null;
        starts_at: string;
        ends_at: string | null;
    }

    // ─── Component State ─────────────────────────────────────────────────────
    // Planned chore details from navigation store
    $: plannedChore = $detailPlannedChoreParams.plannedChore;

    // Local form state
    let newDate = plannedChore?.due_date;
    let loading = false;

    // Schedule management state
    let activeSchedule: any = null;
    let scheduleLoading = false;
    let scheduleSaving = false;
    let isScheduleEditing = false;
    let scheduleErrorMessage = "";
    let loadedChoreId: string | null = null;

    let repeatConfig: RepeatConfig = {
        frequency_type: "none",
        interval: 1,
        days_of_week: [],
        day_of_month: null,
        starts_at: getTodayIso(),
        ends_at: null,
    };

    // ─── Reactive Declarations ───────────────────────────────────────────────
    // Automatically load schedule whenever the selected chore changes
    $: if (plannedChore?.chore?.id && plannedChore.chore.id !== loadedChoreId) {
        loadedChoreId = plannedChore.chore.id;
        fetchSchedule();
    }

    // ─── Helper Functions ────────────────────────────────────────────────────
    /** Returns current date as ISO string (YYYY-MM-DD) */
    function getTodayIso(): string {
        return new Date().toISOString().split("T")[0];
    }

    /** Formats ISO date according to the active user language */
    function formatDate(iso: string, lang: string): string {
        return new Date(iso).toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    /** Converts UI day indices (0=Sun, 1=Mon..6=Sat) into backend bitmask (1=Mon..64=Sun) */
    function daysOfWeekToBitmask(days: number[]): number {
        let mask = 0;
        for (const d of days) {
            if (d === 0) {
                mask |= 1 << 6; // Sunday = 64
            } else if (d >= 1 && d <= 6) {
                mask |= 1 << (d - 1); // 1=Mo(1), 2=Tu(2), 3=We(4), 4=Th(8), 5=Fr(16), 6=Sa(32)
            }
        }
        return mask;
    }

    /** Converts backend bitmask (1=Mon..64=Sun) into UI day indices array */
    function bitmaskToDaysOfWeek(mask: number | null | undefined): number[] {
        const days: number[] = [];
        if (!mask) return days;
        for (let i = 0; i < 6; i++) {
            if (mask & (1 << i)) {
                days.push(i + 1); // 1 = Monday ... 6 = Saturday
            }
        }
        if (mask & (1 << 6)) {
            days.push(0); // 0 = Sunday
        }
        return days;
    }

    /** Russian pluralization helper for numeric labels */
    function getPlural(n: number, one: string, two: string, five: string): string {
        const absN = Math.abs(n) % 100;
        const n1 = absN % 10;
        if (absN > 10 && absN < 20) return five;
        if (n1 > 1 && n1 < 5) return two;
        if (n1 === 1) return one;
        return five;
    }

    /** Generates localized, human-readable description of the schedule */
    function getScheduleDisplayText(schedule: any, lang: string): string {
        if (!schedule || !schedule.is_active || schedule.frequency_type === "none") {
            return lang === "en" ? "No repetition" : "Без повторения";
        }
        const interval = schedule.interval || 1;
        if (schedule.frequency_type === "daily") {
            if (lang === "en") {
                return interval === 1 ? "Every day" : `Every ${interval} days`;
            }
            if (interval === 1) return "Каждый день";
            return `Каждые ${interval} ${getPlural(interval, "день", "дня", "дней")}`;
        }
        if (schedule.frequency_type === "weekly") {
            const days = bitmaskToDaysOfWeek(schedule.days_of_week);
            const dayLabelsEn: Record<number, string> = { 1: "Mo", 2: "Tu", 3: "We", 4: "Th", 5: "Fr", 6: "Sa", 0: "Su" };
            const dayLabelsRu: Record<number, string> = { 1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб", 0: "Вс" };
            const labels = days.map((d) => (lang === "en" ? dayLabelsEn[d] : dayLabelsRu[d])).join(", ");

            if (lang === "en") {
                const prefix = interval === 1 ? "Every week" : `Every ${interval} weeks`;
                return labels ? `${prefix} (${labels})` : prefix;
            }
            const prefix = interval === 1 ? "Каждую неделю" : `Каждые ${interval} ${getPlural(interval, "неделю", "недели", "недель")}`;
            return labels ? `${prefix} (${labels})` : prefix;
        }
        if (schedule.frequency_type === "monthly") {
            const dom = schedule.day_of_month;
            if (lang === "en") {
                const prefix = interval === 1 ? "Every month" : `Every ${interval} months`;
                return dom ? `${prefix} (${dom}th)` : prefix;
            }
            const prefix = interval === 1 ? "Каждый месяц" : `Каждые ${interval} ${getPlural(interval, "месяц", "месяца", "месяцев")}`;
            return dom ? `${prefix} (${dom}-го числа)` : prefix;
        }
        return lang === "en" ? "Scheduled" : "По расписанию";
    }

    /** Clears cached planned chore responses from localStorage */
    function clearPlannedChoresSwrCache() {
        try {
            if (typeof localStorage !== "undefined") {
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith("swr:planned-chores:")) {
                        localStorage.removeItem(k);
                    }
                }
            }
        } catch (e) {
            console.warn("Could not clear SWR cache:", e);
        }
    }

    // ─── Data Fetching ───────────────────────────────────────────────────────
    /** Fetches the active schedule for the current chore */
    async function fetchSchedule() {
        if (!plannedChore?.chore?.id) return;
        scheduleLoading = true;
        try {
            const sched = await getChoreSchedule(plannedChore.chore.id);
            activeSchedule = sched;
            if (sched && sched.is_active) {
                repeatConfig = {
                    frequency_type: sched.frequency_type,
                    interval: sched.interval,
                    days_of_week: bitmaskToDaysOfWeek(sched.days_of_week),
                    day_of_month: sched.day_of_month,
                    starts_at: sched.starts_at || getTodayIso(),
                    ends_at: sched.ends_at,
                };
            } else {
                repeatConfig = {
                    frequency_type: "none",
                    interval: 1,
                    days_of_week: [],
                    day_of_month: null,
                    starts_at: plannedChore.due_date || getTodayIso(),
                    ends_at: null,
                };
            }
        } catch (err) {
            console.error("Failed to load chore schedule:", err);
        } finally {
            scheduleLoading = false;
        }
    }

    // ─── Actions & Handlers ──────────────────────────────────────────────────
    /** Navigates back to the board screen */
    function handleBack() {
        activeTab.set("boardScreen");
    }

    /** Deletes the planned chore */
    async function handleDelete() {
        loading = true;
        try {
            await deletePlannedChore(plannedChore.id);
            clearPlannedChoresSwrCache();
            handleBack();
        } catch (e) {
            console.error("Failed to delete planned chore:", e);
        } finally {
            loading = false;
        }
    }

    /** Toggles completion status of the planned chore */
    async function handleComplete() {
        loading = true;
        try {
            const updated = plannedChore.completed_by
                ? await unCompletePlannedChore(plannedChore.id)
                : await completePlannedChore(plannedChore.id);
            clearPlannedChoresSwrCache();
            handleBack();
        } catch (e) {
            console.error("Failed to toggle chore completion:", e);
        } finally {
            loading = false;
        }
    }

    /** Reschedules the planned chore to a new date */
    async function handleReschedule() {
        if (!newDate || newDate === plannedChore.due_date) return;
        loading = true;
        try {
            await reschedulePlannedChore(plannedChore.id, {
                reschedule_due_date: newDate,
            });
            clearPlannedChoresSwrCache();
            handleBack();
        } catch (e) {
            console.error("Failed to reschedule chore:", e);
        } finally {
            loading = false;
        }
    }

    /** Saves or updates the repetition schedule */
    async function handleSaveSchedule() {
        scheduleSaving = true;
        scheduleErrorMessage = "";
        try {
            if (repeatConfig.frequency_type === "none") {
                if (activeSchedule) {
                    await deleteChoreSchedule(activeSchedule.id, false);
                    activeSchedule = null;
                }
            } else {
                const startsAt = repeatConfig.starts_at || plannedChore.due_date || getTodayIso();
                const payload: any = {
                    frequency_type: repeatConfig.frequency_type,
                    interval: Math.max(1, repeatConfig.interval || 1),
                    starts_at: startsAt,
                    ends_at: repeatConfig.ends_at || null,
                    is_active: true,
                };

                if (repeatConfig.frequency_type === "weekly") {
                    let mask = daysOfWeekToBitmask(repeatConfig.days_of_week || []);
                    if (mask === 0) {
                        const d = new Date(startsAt).getDay();
                        mask = 1 << (d === 0 ? 6 : d - 1);
                    }
                    payload.days_of_week = mask;
                    payload.day_of_month = null;
                } else if (repeatConfig.frequency_type === "monthly") {
                    payload.day_of_month = repeatConfig.day_of_month || new Date(startsAt).getDate();
                    payload.days_of_week = null;
                } else {
                    payload.days_of_week = null;
                    payload.day_of_month = null;
                }

                if (activeSchedule) {
                    activeSchedule = await updateChoreSchedule(activeSchedule.id, payload);
                } else {
                    const finalAssignedTo =
                        plannedChore.assigned_to?.id ||
                        $userSession.userId;
                    payload.assigned_to_id = finalAssignedTo;
                    activeSchedule = await createChoreSchedule(plannedChore.chore.id, payload);
                }
            }

            clearPlannedChoresSwrCache();
            isScheduleEditing = false;
        } catch (e: any) {
            console.error("Failed to save schedule:", e);
            scheduleErrorMessage =
                e?.message ||
                ($language === "en" ? "Failed to save schedule" : "Не удалось сохранить расписание");
        } finally {
            scheduleSaving = false;
        }
    }

    /** Disables and soft-deletes the schedule */
    async function handleDeleteSchedule() {
        if (!activeSchedule) return;
        scheduleSaving = true;
        scheduleErrorMessage = "";
        try {
            await deleteChoreSchedule(activeSchedule.id, false);
            activeSchedule = null;
            repeatConfig = {
                frequency_type: "none",
                interval: 1,
                days_of_week: [],
                day_of_month: null,
                starts_at: plannedChore?.due_date || getTodayIso(),
                ends_at: null,
            };
            clearPlannedChoresSwrCache();
            isScheduleEditing = false;
        } catch (e: any) {
            console.error("Failed to delete schedule:", e);
            scheduleErrorMessage =
                e?.message ||
                ($language === "en" ? "Failed to disable schedule" : "Не удалось отключить расписание");
        } finally {
            scheduleSaving = false;
        }
    }

    let isEditingSubtasks = false;
    let subtaskErrorMessage = "";

    async function handleSubtasksSave(newMsg: string) {
        if (!plannedChore) return;
        try {
            await updatePlannedChoreMessage(plannedChore.id, newMsg);
            plannedChore.message = newMsg;
            subtaskErrorMessage = "";
            clearPlannedChoresSwrCache();
        } catch (e: any) {
            console.error("Failed to update subtasks:", e);
            subtaskErrorMessage =
                e?.message ||
                ($language === "en" ? "Failed to save subtasks" : "Не удалось сохранить подзадачи");
        }
    }
</script>

<div class="page">
    <header class="page-header">
        <button class="back-btn" on:click={handleBack}>
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width={18}
                height={18}
            />
            {$t.common.back}
        </button>

        <h1>{plannedChore?.chore.name}</h1>

        <div class="header-spacer"></div>
    </header>

    <!-- Chore header: Icon -->
    <div class="chore-header">
        <div class="chore-icon-wrap">
            <span class="icon-glow"></span>
            <ChoreIcon chore={plannedChore.chore} size={68} />
        </div>
    </div>

    <!-- Subtasks & Notes section -->
    <div class="subtasks-detail-card">
        <div class="subtasks-header-row">
            <div class="subtasks-title-wrap">
                <Icon icon="material-symbols:checklist-rounded" width="20" height="20" />
                <span class="subtasks-title">Подзадачи и заметки</span>
            </div>
            <button
                type="button"
                class="subtasks-edit-toggle"
                on:click={() => (isEditingSubtasks = !isEditingSubtasks)}
            >
                <Icon
                    icon={isEditingSubtasks ? "material-symbols:check-rounded" : "material-symbols:edit-rounded"}
                    width="15"
                    height="15"
                />
                <span>{isEditingSubtasks ? "Готово" : "Изменить"}</span>
            </button>
        </div>

        {#if isEditingSubtasks}
            <div class="subtasks-editor-wrap">
                <SubtaskEditor
                    bind:message={plannedChore.message}
                    onChange={handleSubtasksSave}
                />
            </div>
        {:else}
            <PlannedChoreSubtasks
                message={plannedChore.message}
                choreId={plannedChore.id}
                isChoreDone={!!plannedChore.completed_by}
                onUpdate={(newMsg) => {
                    plannedChore.message = newMsg;
                }}
            />
            {#if !plannedChore.message}
                <p class="empty-subtasks-note">
                    Подзадач нет. Нажмите «Изменить», чтобы добавить чек-лист или комментарий.
                </p>
            {/if}
        {/if}

        {#if subtaskErrorMessage}
            <p class="subtask-error">{subtaskErrorMessage}</p>
        {/if}
    </div>

    <!-- Chore Details -->
    <div class="details">
        <!-- Due date row with hidden date input -->
        <div class="detail-row date-row">
            <div class="detail-icon">
                <Icon
                    icon="material-symbols:calendar-today-rounded"
                    width={18}
                    height={18}
                />
            </div>
            <div class="detail-text">
                <span class="detail-label">{$t.chores.date}</span>
                <span class="detail-value"
                    >{formatDate(newDate ?? plannedChore.due_date, $language)}</span
                >
            </div>
            <div class="edit-hint">
                <Icon
                    icon="material-symbols:edit-rounded"
                    width="15"
                    height="15"
                />
            </div>
            <input
                class="date-input-hidden"
                type="date"
                bind:value={newDate}
                min={new Date().toISOString().split("T")[0]}
            />
        </div>

        <div class="divider"></div>

        <div class="detail-row">
            <div class="detail-icon">
                <Icon
                    icon="material-symbols:person-rounded"
                    width="18"
                    height="18"
                />
            </div>
            <div class="detail-text">
                <span class="detail-label">{$t.chores.assigned}</span>
                {#if plannedChore.assigned_to}
                    <div class="user-chip">
                        <UserAvatar user={plannedChore.assigned_to} size={22} />
                        <span class="detail-value">
                            {plannedChore.assigned_to.name}
                            {plannedChore.assigned_to.surname}
                        </span>
                    </div>
                {:else}
                    <span class="detail-value muted">{$t.common.none}</span>
                {/if}
            </div>
        </div>

        <div class="divider"></div>

        <div class="detail-row">
            <div
                class="detail-icon"
                class:success-icon={!!plannedChore.completed_by}
            >
                <Icon
                    icon="material-symbols:check-circle-rounded"
                    width="18"
                    height="18"
                />
            </div>
            <div class="detail-text">
                <span class="detail-label">{$t.chores.completedBy}</span>
                {#if plannedChore.completed_by}
                    <div class="user-chip">
                        <UserAvatar
                            user={plannedChore.completed_by}
                            size={22}
                        />
                        <span class="detail-value">
                            {plannedChore.completed_by.name}
                            {plannedChore.completed_by.surname}
                        </span>
                    </div>
                {:else}
                    <span class="detail-value muted">{$t.common.notYet}</span>
                {/if}
            </div>
        </div>

        <div class="divider"></div>

        <div class="detail-row">
            <div class="detail-icon">
                <Icon
                    icon="material-symbols:paid-rounded"
                    width="18"
                    height="18"
                />
            </div>
            <div class="detail-text">
                <span class="detail-label">{$t.common.reward}</span>
                <span class="detail-value"
                    >🪙 {plannedChore.chore.valuation} {$t.common.coins}</span
                >
            </div>
        </div>

        <div class="divider"></div>

        <div
            class="detail-row schedule-row"
            on:click={() => (isScheduleEditing = !isScheduleEditing)}
            on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    isScheduleEditing = !isScheduleEditing;
                }
            }}
            role="button"
            tabindex="0"
        >
            <div
                class="detail-icon"
                class:active-schedule-icon={!!activeSchedule?.is_active}
            >
                <Icon
                    icon="material-symbols:sync-rounded"
                    width="18"
                    height="18"
                />
            </div>
            <div class="detail-text">
                <span class="detail-label"
                    >{$t.repeat?.title ||
                        ($language === "en" ? "Repeat" : "Повторение")}</span
                >
                <span
                    class="detail-value"
                    class:muted={!activeSchedule?.is_active}
                >
                    {scheduleLoading
                        ? $language === "en"
                            ? "Loading..."
                            : "Загрузка..."
                        : getScheduleDisplayText(activeSchedule, $language)}
                </span>
            </div>
            <div class="edit-hint">
                <Icon
                    icon={isScheduleEditing
                        ? "material-symbols:expand-less-rounded"
                        : "material-symbols:edit-rounded"}
                    width="16"
                    height="16"
                />
            </div>
        </div>

        {#if isScheduleEditing}
            <div class="schedule-editor-wrap">
                {#if scheduleErrorMessage}
                    <div class="schedule-error">
                        <Icon
                            icon="material-symbols:error-rounded"
                            width="16"
                            height="16"
                        />
                        <span>{scheduleErrorMessage}</span>
                    </div>
                {/if}

                <RepeatSelector bind:value={repeatConfig} />

                <div class="schedule-editor-actions">
                    <button
                        type="button"
                        class="schedule-btn schedule-save-btn"
                        on:click={handleSaveSchedule}
                        disabled={scheduleSaving}
                    >
                        <Icon
                            icon="material-symbols:check-rounded"
                            width="16"
                            height="16"
                        />
                        {scheduleSaving
                            ? $t.common.saving
                            : $language === "en"
                              ? "Save repeat schedule"
                              : "Сохранить расписание"}
                    </button>

                    {#if activeSchedule}
                        <button
                            type="button"
                            class="schedule-btn schedule-delete-btn"
                            on:click={handleDeleteSchedule}
                            disabled={scheduleSaving}
                        >
                            <Icon
                                icon="material-symbols:delete-outline-rounded"
                                width="16"
                                height="16"
                            />
                            {$language === "en"
                                ? "Disable repeat"
                                : "Отключить повторение"}
                        </button>
                    {/if}
                </div>
            </div>
        {/if}
    </div>

    <!-- Action buttons -->
    <div class="actions">
        <button
            class="action-btn"
            class:action-success={!plannedChore.completed_by}
            class:action-warn={!!plannedChore.completed_by}
            on:click={handleComplete}
            disabled={loading}
        >
            <Icon
                icon={plannedChore.completed_by
                    ? "material-symbols:undo-rounded"
                    : "material-symbols:check-rounded"}
                width="18"
                height="18"
            />
            {plannedChore.completed_by
                ? $t.chores.cancelCompletion
                : $t.chores.markDone}
        </button>

        {#if !plannedChore.completed_by && newDate && newDate !== plannedChore.due_date}
            <button
                class="action-btn action-neutral"
                on:click={handleReschedule}
                disabled={loading}
            >
                <Icon
                    icon="material-symbols:calendar-month-rounded"
                    width="18"
                    height="18"
                />
                {loading ? $t.common.saving : $t.chores.confirmReschedule}
            </button>
        {/if}

        <button
            class="action-btn action-danger"
            on:click={handleDelete}
            disabled={loading}
        >
            <Icon
                icon="material-symbols:delete-rounded"
                width="18"
                height="18"
            />
            {loading ? $t.common.deleting : $t.chores.deleteChore}
        </button>
    </div>
</div>

<style>
    .page {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        background: var(--bg);
        padding-top: env(safe-area-inset-top);
    }

    .page-header {
        height: 56px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 4px;
        flex-shrink: 0;
    }

    .page-header h1 {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        white-space: nowrap;
    }

    .back-btn {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 8px 12px;
        background: none;
        border: none;
        color: var(--accent);
        font-size: 15px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        border-radius: 10px;
        z-index: 1;
    }

    .back-btn:active {
        opacity: 0.6;
    }

    .header-spacer {
        width: 80px;
    }

    /* ── HEADER ──────────────────────────────────── */
    .chore-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 8px 16px 4px;
    }

    .chore-icon-wrap {
        position: relative;
        width: 100px;
        height: 100px;
        border-radius: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            160deg,
            color-mix(in srgb, var(--accent) 16%, var(--surface)),
            var(--surface)
        );
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 12px 32px rgba(0, 0, 0, 0.1);
        animation: icon-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes icon-pop {
        from {
            transform: scale(0.7);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .icon-glow {
        position: absolute;
        inset: -20px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--accent) 18%, transparent);
        filter: blur(28px);
        pointer-events: none;
        z-index: 0;
    }

    /* ── SUBTASKS DETAIL CARD ────────────────────── */
    .subtasks-detail-card {
        margin: 12px 16px 4px;
        background: var(--surface);
        border-radius: 22px;
        padding: 16px;
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .subtasks-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .subtasks-title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-primary);
    }

    .subtasks-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .subtasks-edit-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--surface-alt);
        border: 1.5px solid var(--border);
        padding: 7px 14px;
        min-height: 36px;
        border-radius: 12px;
        font-size: 13.5px;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: all 0.15s ease;
    }

    .subtasks-edit-toggle:active {
        transform: scale(0.95);
    }

    .subtasks-edit-toggle:hover {
        border-color: var(--accent);
        color: var(--accent);
    }

    .subtasks-editor-wrap {
        margin-top: 4px;
    }

    .empty-subtasks-note {
        font-size: 13px;
        color: var(--text-muted);
        margin: 0;
        font-style: italic;
    }

    .subtask-error {
        font-size: 12px;
        color: var(--danger, #ef4444);
        margin: 0;
        font-weight: 500;
    }

    /* ── DETAILS ─────────────────────────────────── */
    .details {
        margin: 12px 16px 4px;
        background: var(--surface);
        border-radius: 22px;
        overflow: hidden;
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .detail-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 16px;
    }

    /* Date row: hidden date input overlay */
    .date-row {
        position: relative;
        cursor: pointer;
    }

    .date-input-hidden {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        border: none;
        background: none;
    }

    .detail-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--accent) 10%, var(--surface-alt));
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent);
        flex-shrink: 0;
    }

    .success-icon {
        background: color-mix(in srgb, var(--success) 12%, transparent);
        color: var(--success);
    }

    .detail-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
    }

    .detail-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.6px;
    }

    .detail-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .detail-value.muted {
        color: var(--text-muted);
        font-weight: 400;
    }

    .edit-hint {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--accent) 10%, var(--surface-alt));
        color: var(--accent);
        flex-shrink: 0;
        opacity: 0.7;
    }

    .user-chip {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .divider {
        height: 0.5px;
        background: var(--border);
        margin: 0 16px;
    }

    .schedule-row {
        cursor: pointer;
        user-select: none;
        transition: background-color 0.15s ease;
    }

    .schedule-row:active {
        background: color-mix(in srgb, var(--accent) 6%, transparent);
    }

    .active-schedule-icon {
        background: color-mix(in srgb, var(--accent) 18%, var(--surface-alt));
        color: var(--accent);
    }

    .schedule-editor-wrap {
        padding: 14px 16px 18px;
        background: color-mix(in srgb, var(--surface) 80%, var(--surface-alt));
        border-top: 0.5px solid var(--border);
        display: flex;
        flex-direction: column;
        gap: 12px;
        animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .schedule-error {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #e85a5a;
        font-size: 13px;
        font-weight: 500;
        padding: 8px 12px;
        border-radius: 12px;
        background: rgba(232, 90, 90, 0.1);
        border: 1px solid rgba(232, 90, 90, 0.2);
    }

    .schedule-editor-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
    }

    .schedule-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px 16px;
        border: none;
        border-radius: 14px;
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition:
            opacity 0.15s ease,
            transform 0.15s ease;
    }

    .schedule-btn:active {
        opacity: 0.7;
        transform: scale(0.98);
    }

    .schedule-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .schedule-save-btn {
        background: var(--accent);
        color: #ffffff;
        box-shadow: 0 4px 14px
            color-mix(in srgb, var(--accent) 30%, transparent);
    }

    .schedule-delete-btn {
        background: rgba(232, 90, 90, 0.1);
        color: #e85a5a;
    }

    /* ── ACTIONS ─────────────────────────────────── */
    .actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 16px 4px;
    }

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 18px;
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition:
            opacity 0.15s ease,
            transform 0.15s ease;
    }

    .action-btn:active {
        opacity: 0.7;
        transform: scale(0.98);
    }
    .action-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        transform: none;
    }

    .action-success {
        background: color-mix(in srgb, var(--success) 14%, var(--surface));
        color: var(--success);
        box-shadow: 0 4px 14px
            color-mix(in srgb, var(--success) 15%, transparent);
    }

    .action-warn {
        background: color-mix(in srgb, var(--accent) 12%, var(--surface));
        color: var(--accent);
    }

    .action-neutral {
        background: var(--surface);
        color: var(--text-primary);
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .action-danger {
        background: rgba(232, 90, 90, 0.1);
        color: #e85a5a;
    }
</style>
