<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import RepeatSelector from "$features/chores/RepeatSelector.svelte";
    import { createPlannedChore } from "$api/chores";
    import { getFamilyMembers } from "$api/family";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import ChoreIcon from "$ui/ChoreIcon.svelte";
    import Backbtn from "$ui/backbtn.svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
    import CustomTextarea from "@/components/ui/CustomTextarea.svelte";
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
    let comment = "";
    let dueDate = new Date().toISOString().split("T")[0];
    let assignedTo: string | null = null;

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
        if (!selectedChore) return;

        const payload = {
            message: comment || "",
            assigned_to_id: assignedTo,
            due_date: dueDate || null,
        };

        try {
            await createPlannedChore(selectedChore.id, payload);
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

        <h1>
            {selectedChore?.name}
        </h1>

        <div class="header-spacer"></div>
    </header>

    <div class="selected-header">
        <div class="chore-icon-wrap">
            <ChoreIcon chore={selectedChore} size={68} />
        </div>
    </div>

    <div class="detail-form">
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

        <!-- Комментарий + Дата в одной секции -->
        <div class="section">
            <div class="section-label">Детали</div>

            <CustomTextarea
                bind:value={comment}
                placeholder="Комментарий..."
                maxlength={500}
                rows={2}
            />

            <div class="divider" />

            <input class="field-input" type="date" bind:value={dueDate} />
        </div>

        <!-- Повтор -->
        <div class="section">
            <RepeatSelector bind:value={repeat} />
        </div>
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
    /* ── STEP 2 HEADER ────────────────────────────── */
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

    /* ── FORM ─────────────────────────────────────── */
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

    /* ── USERS ────────────────────────────────────── */
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

    /* ── DATE INPUT ───────────────────────────────── */
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

    /* ── ADD BUTTON ───────────────────────────────── */
    .add-btn {
        position: sticky;
        bottom: 0;
        padding: 12px 16px 8px;
        background: linear-gradient(to bottom, transparent, var(--bg) 40%);
    }
</style>
