<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import RepeatSelector from "$features/chores/RepeatSelector.svelte";
    import { createPlannedChore, createQuickPlannedChore } from "$api/chores";
    import { getFamilyMembers } from "$api/family";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import ChoreIcon from "$ui/ChoreIcon.svelte";
    import Backbtn from "$ui/backbtn.svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import CustomTextarea from "$ui/CustomTextarea.svelte";
    import AvatarBuilder from "$features/settings/AvatarBuilder.svelte";
    import { swr } from "$lib/swr";
    const dispatch = createEventDispatcher();
    import { createPlannedChoreParams, activeTab } from "$lib/navigation";

    // ─── Types ───────────────────────────────────────────────────────────────

    type FrequencyType = "none" | "daily" | "weekly" | "monthly";

    interface RepeatConfig {
        frequency_type: FrequencyType;
        interval: number;
        days_of_week: number[];
        day_of_month: number | null;
        starts_at: string;
        ends_at: string | null;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    $: selectedChore = $createPlannedChoreParams.chore;
    $: isQuickTask = $createPlannedChoreParams.isQuickTask;

    let comment = "";
    let dueDate = new Date().toISOString().split("T")[0];
    let assignedTo: string | null = null;

    // Быстрая задача
    let quickTaskName = "";
    let quickTaskValuation = 5;
    let quickTaskAvatar = {
        icon: "material-symbols:bolt-rounded",
        icon_color: "#ffffff",
        icon_bg: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
    };

    const VALUATION_OPTIONS = [1, 2, 3, 5, 8, 10, 15, 20];

    let repeat: RepeatConfig = {
        frequency_type: "none",
        interval: 1,
        days_of_week: [],
        day_of_month: null,
        starts_at: getTodayIso(),
        ends_at: null,
    };

    // ─── Data fetching ───────────────────────────────────────────────────────

    const members = swr("family-members", getFamilyMembers);

    $: familyMembers = $members.data ?? [];
    $: loading = $members.loading;
    $: error = $members.error;

    function getTodayIso(): string {
        return new Date().toISOString().split("T")[0];
    }

    // ─── Navigation ──────────────────────────────────────────────────────────

    function handleBack() {
        activeTab.set("createPlannedChoreStepOne");
    }

    async function add() {
        if (!isQuickTask && !selectedChore) return;

        const payload = {
            message: comment || "",
            assigned_to_id: assignedTo,
            due_date: dueDate || null,
        };

        try {
            if (isQuickTask) {
                await createQuickPlannedChore({
                    name: quickTaskName,
                    valuation: quickTaskValuation,
                    icon: quickTaskAvatar.icon,
                    icon_color: quickTaskAvatar.icon_color,
                    icon_bg: quickTaskAvatar.icon_bg,
                    ...payload,
                });
                console.log("quick task", {
                    quickTaskName,
                    quickTaskValuation,
                    quickTaskAvatar,
                    ...payload,
                });
            } else {
                await createPlannedChore(selectedChore!.id, payload);
            }
            dispatch("add");
            activeTab.set("boardScreen");
        } catch (e) {
            console.error("Failed to create planned chore:", e);
        }
    }
</script>

<div class="page">
    <header class="page-header">
        <Backbtn label="Назад" on:click={handleBack} />
        <h1>{isQuickTask ? "Быстрая задача" : selectedChore?.name}</h1>
        <div class="header-spacer"></div>
    </header>

    <!-- Шапка: иконка шаблона или конструктор аватара -->
    {#if isQuickTask}
        <div class="quick-header">
            <div class="section">
                <AvatarBuilder
                    initialIcon={quickTaskAvatar.icon}
                    initialIconColor={quickTaskAvatar.icon_color}
                    initialBg={quickTaskAvatar.icon_bg}
                    onchange={(v) => (quickTaskAvatar = v)}
                />
            </div>
        </div>
    {:else}
        <div class="selected-header">
            <div class="chore-icon-wrap">
                <ChoreIcon chore={selectedChore} size={68} />
            </div>
        </div>
    {/if}

    <div class="detail-form">
        <!-- Название (только для быстрой задачи) -->
        {#if isQuickTask}
            <div class="section">
                <div class="section-label">Название</div>
                <input
                    class="field-input"
                    type="text"
                    placeholder="Что нужно сделать..."
                    bind:value={quickTaskName}
                    maxlength={100}
                />
            </div>

            <!-- Награда -->
            <div class="section">
                <div class="section-label">Награда</div>
                <div class="valuation-row">
                    {#each VALUATION_OPTIONS as v}
                        <button
                            class="val-btn"
                            class:val-active={quickTaskValuation === v}
                            on:click={() => (quickTaskValuation = v)}
                        >
                            🪙 {v}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Кому назначить -->
        <div class="section">
            <div class="section-label">Кому назначить</div>
            <div class="users-row">
                <button
                    class="user-btn"
                    class:user-active={assignedTo === null}
                    on:click={() => (assignedTo = null)}
                >
                    <div
                        class="user-avatar-wrap"
                        class:active={assignedTo === null}
                    >
                        <UserAvatar size={44} />
                    </div>
                    <span>Никому</span>
                </button>
                {#each familyMembers?.members ?? [] as user}
                    <button
                        class="user-btn"
                        class:user-active={assignedTo === user.id}
                        on:click={() => (assignedTo = user.id)}
                    >
                        <div
                            class="user-avatar-wrap"
                            class:active={assignedTo === user.id}
                        >
                            <UserAvatar {user} size={44} />
                        </div>
                        <span>{user.name}</span>
                    </button>
                {/each}
            </div>
        </div>

        <!-- Комментарий + Дата -->
        <div class="section">
            <div class="section-label">Детали</div>
            <CustomTextarea
                bind:value={comment}
                placeholder="Комментарий..."
                maxlength={500}
                rows={2}
            />
            <div class="divider"></div>
            <input class="field-input" type="date" bind:value={dueDate} />
        </div>

        <!-- Повтор -->
        {#if !isQuickTask}
            <div class="section">
                <RepeatSelector bind:value={repeat} />
            </div>
        {/if}
    </div>

    <div class="add-btn">
        <ButtonPrimaryGlow on:click={add} label="Добавить" fullWidth />
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
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0px;
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

    .header-spacer {
        width: 80px;
    }

    /* ── Шапка шаблона ────────────────────────────── */
    .selected-header {
        display: flex;
        justify-content: center;
        padding: 8px 0 16px;
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

    /* ── Шапка быстрой задачи ─────────────────────── */
    .quick-header {
        padding: 0 8px 4px;
    }

    /* ── Награда ──────────────────────────────────── */
    .valuation-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .val-btn {
        padding: 7px 14px;
        border-radius: 20px;
        border: 1.5px solid var(--border);
        background: none;
        font-size: 13px;
        font-weight: 700;
        font-family: inherit;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.15s;
    }

    .val-btn:active {
        transform: scale(0.94);
    }

    .val-active {
        background: var(--accent-soft);
        border-color: var(--accent);
        color: var(--accent);
    }

    /* ── Форма ────────────────────────────────────── */
    .detail-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0 8px 0px;
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border-radius: 22px;
        background: var(--surface);
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .section-label {
        font-size: 11px;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.8px;
    }

    .divider {
        height: 1px;
        background: var(--border);
        margin: 0 -4px;
    }

    /* ── Пользователи ─────────────────────────────── */
    .users-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding: 2px 2px 4px;
        scrollbar-width: none;
    }

    .users-row::-webkit-scrollbar {
        display: none;
    }

    .user-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 54px;
        padding: 0;
        border: none;
        background: none;
        font-family: inherit;
        flex-shrink: 0;
        transition: transform 0.15s ease;
    }

    .user-btn:active {
        transform: scale(0.9);
    }

    .user-avatar-wrap {
        padding: 3px;
        border-radius: 50%;
        border: 2.5px solid transparent;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
    }

    .user-avatar-wrap.active {
        border-color: var(--accent);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 15%, transparent);
    }

    .user-btn span {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        transition: color 0.15s;
    }

    .user-active span {
        color: var(--accent);
    }

    /* ── Поля ввода ───────────────────────────────── */
    .field-input {
        width: 100%;
        box-sizing: border-box;
        height: 44px;
        padding: 0 14px;
        border: none;
        outline: none;
        border-radius: 14px;
        background: var(--surface-alt);
        color: var(--text-primary);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        transition: box-shadow 0.2s ease;
    }

    .field-input:focus {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
    }

    .field-input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(0.5);
        cursor: pointer;
    }

    /* ── Кнопка ───────────────────────────────────── */
    .add-btn {
        position: sticky;
        bottom: 0;
        padding: 12px 16px 8px;
        background: linear-gradient(to bottom, transparent, var(--bg) 40%);
    }
</style>
