<script lang="ts">
    // ─── Imports ─────────────────────────────────────────────────────────────
    import Icon from "@iconify/svelte";

    // UI Components
    import ChoreIcon from "$ui/ChoreIcon.svelte";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import PlannedChoreSubtasks from "$features/chores/PlannedChoreSubtasks.svelte";

    // Types & Localization
    import type { AnyPlannedChore } from "$types/index";
    import { t } from "$lib/i18n";

    // ─── Component Props / Dispatch ──────────────────────────────────────────
    export let item: AnyPlannedChore;
    export let onToggle: (item: AnyPlannedChore) => void;
    export let onClick: () => void;

    // ─── Reactive Declarations ───────────────────────────────────────────────
    // Check if the chore is completed
    $: done = item.completed_by !== null;

    // Normalize display fields across standard and quick chores
    $: title = item.is_quick ? item.name : item.chore.name;
    $: message = item.message;
</script>

<div
    class="card"
    class:card-done={done}
    onclick={onClick}
    onkeydown={(e) => e.key === "Enter" && onClick()}
    role="button"
    tabindex="0"
>
    <!-- Chore icon: distinct for regular and quick tasks -->
    {#if item.is_quick}
        <div class="quick-icon" style="background: {item.icon_bg}">
            <Icon icon={item.icon} width={24} color={item.icon_color} />
        </div>
    {:else}
        <ChoreIcon chore={item.chore} size={44}/>
    {/if}

    <div class="content">
        <div class="title" class:completed-text={done}>
            {title}
            {#if !item.is_quick && item.schedule_id}
                <span class="repeat-icon" title="Recurring chore">
                    <Icon icon="material-symbols:repeat-rounded" width="14" height="14" />
                </span>
            {/if}
        </div>

        {#if message}
            <PlannedChoreSubtasks
                {message}
                choreId={item.id}
                isQuick={item.is_quick}
                previewMode={true}
                isChoreDone={done}
                onUpdate={(newMsg) => {
                    item.message = newMsg;
                }}
            />
        {/if}

        {#if item.assigned_to && !item.completed_by}
            <div class="assignee-badge">
                <UserAvatar user={item.assigned_to} size={18} />
                <span class="name">{item.assigned_to.name}</span>
            </div>
        {:else if item.completed_by}
            <div class="completed-badge">
                <UserAvatar user={item.completed_by} size={18} />
                <span class="name">{item.completed_by.name}</span>
            </div>
        {/if}
    </div>

    <div class="right">
        <button
            class="check"
            class:checked={done}
            onclick={(e) => {
                e.stopPropagation();
                onToggle?.(item);
            }}
            aria-label={done
                ? $t.chores.markUndone
                : $t.chores.markDone}
        >
            {#if done}
                <svg
                    class="check-icon"
                    width="12"
                    height="10"
                    viewBox="0 0 12 10"
                    fill="none"
                >
                    <path
                        d="M1.5 5L4.5 8L10.5 2"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            {/if}
        </button>
    </div>
</div>

<style>
    .card {
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 13px 16px;
        border-radius: 18px;
        background: var(--surface);
        border: 0.5px solid var(--border-subtle);
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.04), 0 1px 4px -1px rgba(0, 0, 0, 0.02);
        transition:
            opacity 0.22s ease,
            transform 0.14s cubic-bezier(0.25, 1, 0.5, 1),
            box-shadow 0.18s ease;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
    }

    .card:active {
        transform: scale(0.97) translateZ(0);
    }

    .card.card-done {
        opacity: 0.55;
        background: var(--surface-alt);
        box-shadow: none;
        border-color: transparent;
    }

    /* ── CONTENT ─────────────────────────────────── */
    .content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        position: relative;
        z-index: 1;
    }

    .title {
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: -0.25px;
        line-height: 1.3;
        transition: color 0.2s ease;
    }

    .completed-text {
        text-decoration: line-through;
        color: var(--text-muted);
    }

    /* ── BADGES (APPLE PILL) ─────────────────────── */
    .assignee-badge,
    .completed-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 8px 2px 4px;
        border-radius: 999px;
        align-self: flex-start;
        margin-top: 2px;
    }

    .assignee-badge {
        background: var(--surface-alt);
        border: 0.5px solid var(--border-subtle);
    }

    .completed-badge {
        background: var(--success-soft);
        border: 0.5px solid color-mix(in srgb, var(--success) 22%, transparent);
    }

    .name {
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
        font-size: 11.5px;
        font-weight: 500;
        letter-spacing: -0.1px;
        color: var(--text-secondary);
    }

    /* ── CHECK BUTTON (HIG 44PT TOUCH TARGET) ─────── */
    .right {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        min-width: 44px;
        min-height: 44px;
        position: relative;
        z-index: 1;
    }

    .check {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        border: 2px solid var(--border);
        background: var(--surface);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: transparent;
        padding: 0;
        transition:
            transform 0.14s cubic-bezier(0.25, 1, 0.5, 1),
            background-color 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .check:active {
        transform: scale(0.88) translateZ(0);
    }

    .check.checked {
        border-color: var(--success);
        background: var(--success);
        color: #ffffff;
        box-shadow: 0 2px 8px var(--success-soft);
    }

    .check-icon {
        animation: checkAppear 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .quick-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border-radius: 14px;
        flex-shrink: 0;
    }

    @keyframes checkAppear {
        from {
            transform: scale(0) rotate(-20deg);
            opacity: 0;
        }
        to {
            transform: scale(1) rotate(0);
            opacity: 1;
        }
    }

    .repeat-icon {
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        margin-left: 4px;
        color: var(--accent);
        opacity: 0.9;
    }
</style>
