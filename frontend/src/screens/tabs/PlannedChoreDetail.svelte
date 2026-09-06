<script lang="ts">
    import UserAvatar from "$ui/UserAvatar.svelte";
    import ChoreIcon from "$ui/ChoreIcon.svelte";
    import Icon from "@iconify/svelte";
    import {
        deletePlannedChore,
        reschedulePlannedChore,
        completePlannedChore,
        unCompletePlannedChore,
    } from "$api/chores";
    import { detailPlannedChoreParams, activeTab } from "$lib/navigation";

    $: plannedChore = $detailPlannedChoreParams.plannedChore;

    let newDate = plannedChore?.due_date;
    let loading = false;

    function formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    function handleBack() {
        activeTab.set("boardScreen");
    }

    async function handleDelete() {
        loading = true;
        try {
            await deletePlannedChore(plannedChore.id);
            handleBack();
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }

    async function handleComplete() {
        loading = true;
        try {
            const updated = plannedChore.completed_by
                ? await unCompletePlannedChore(plannedChore.id)
                : await completePlannedChore(plannedChore.id);
            handleBack();
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }

    async function handleReschedule() {
        if (!newDate || newDate === plannedChore.due_date) return;
        loading = true;
        try {
            await reschedulePlannedChore(plannedChore.id, {
                reschedule_due_date: newDate,
            });
            handleBack();
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }
</script>

<div class="page">
    <header class="page-header">
        <button class="back-btn" on:click={handleBack}>
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                width="18"
                height="18"
            />
            Назад
        </button>

        <h1>{plannedChore?.chore.name}</h1>

        <div class="header-spacer"></div>
    </header>

    <!-- Иконка + сообщение -->
    <div class="chore-header">
        <div class="chore-icon-wrap">
            <span class="icon-glow" />
            <ChoreIcon chore={plannedChore.chore} size={68} />
        </div>
        {#if plannedChore.message}
            <p class="chore-message">«{plannedChore.message}»</p>
        {/if}
    </div>

    <!-- Детали -->
    <div class="details">
        <!-- Дата — кликабельная строка с инпутом -->
        <div class="detail-row date-row">
            <div class="detail-icon">
                <Icon
                    icon="material-symbols:calendar-today-rounded"
                    width="18"
                    height="18"
                />
            </div>
            <div class="detail-text">
                <span class="detail-label">Дата</span>
                <span class="detail-value"
                    >{formatDate(newDate ?? plannedChore.due_date)}</span
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

        <div class="divider" />

        <div class="detail-row">
            <div class="detail-icon">
                <Icon
                    icon="material-symbols:person-rounded"
                    width="18"
                    height="18"
                />
            </div>
            <div class="detail-text">
                <span class="detail-label">Назначено</span>
                {#if plannedChore.assigned_to}
                    <div class="user-chip">
                        <UserAvatar user={plannedChore.assigned_to} size={22} />
                        <span class="detail-value">
                            {plannedChore.assigned_to.name}
                            {plannedChore.assigned_to.surname}
                        </span>
                    </div>
                {:else}
                    <span class="detail-value muted">Никому</span>
                {/if}
            </div>
        </div>

        <div class="divider" />

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
                <span class="detail-label">Выполнено</span>
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
                    <span class="detail-value muted">Ещё нет</span>
                {/if}
            </div>
        </div>

        <div class="divider" />

        <div class="detail-row">
            <div class="detail-icon">
                <Icon
                    icon="material-symbols:paid-rounded"
                    width="18"
                    height="18"
                />
            </div>
            <div class="detail-text">
                <span class="detail-label">Награда</span>
                <span class="detail-value"
                    >🪙 {plannedChore.chore.valuation} монет</span
                >
            </div>
        </div>
    </div>

    <!-- Кнопки -->
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
                ? "Отменить выполнение"
                : "Отметить выполненным"}
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
                {loading ? "Сохранение..." : "Подтвердить перенос"}
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
            {loading ? "Удаление..." : "Удалить задачу"}
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

    .chore-message {
        font-size: 14px;
        color: var(--text-muted);
        font-style: italic;
        text-align: center;
        margin: 0;
        max-width: 260px;
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

    /* Дата-строка — поверх неё прозрачный инпут */
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
