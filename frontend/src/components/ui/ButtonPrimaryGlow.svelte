<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { onMount } from "svelte";
    import { language } from "$lib/settings.js";

    export let label: string = "";
    export let disabled = false;
    export let fullWidth = false;

    $: displayLabel = label || ($language === "en" ? "Continue" : "Продолжить");

    const dispatch = createEventDispatcher();

    let buttonEl: HTMLButtonElement;
    let visible = false;

    onMount(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    visible = true;
                    observer.disconnect();
                }
            },
            { threshold: 0.2 },
        );

        observer.observe(buttonEl);
        return () => observer.disconnect();
    });
</script>

<button
    bind:this={buttonEl}
    class="btn-action"
    class:visible
    class:full-width={fullWidth}
    {disabled}
    on:click={() => !disabled && dispatch("click")}
>
    <!-- фоновый glow -->
    <span class="glow"></span>
    <!-- блик -->
    <span class="shine"></span>

    <span class="label">{displayLabel}</span>
</button>

<style>
    .btn-action {
        position: relative;
        overflow: hidden;

        /* градиент как у calendar-card */
        background: var(--accent-gradient, linear-gradient(
            160deg,
            color-mix(in srgb, var(--accent) 85%, white) 0%,
            var(--accent) 100%
        ));
        color: #ffffff;

        border: none;
        padding: 15px 22px;
        border-radius: 20px;

        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.2px;

        cursor: pointer;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        opacity: 0;
        transform: translateY(20px) scale(0.97);

        -webkit-tap-highlight-color: transparent;

        box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.06),
            0 8px 24px var(--accent-glow);

        transition:
            opacity 0.35s ease,
            transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.2s ease;
    }

    /* ── появление ───────────────────────────────── */
    .btn-action.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        animation: button-enter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes button-enter {
        0%   { transform: translateY(20px) scale(0.97); }
        70%  { transform: translateY(-3px) scale(1.02); }
        100% { transform: translateY(0) scale(1); }
    }

    /* ── декоративный glow внутри ────────────────── */
    .glow {
        position: absolute;
        width: 120px;
        height: 120px;
        right: -30px;
        top: -40px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%);
        pointer-events: none;
    }

    /* ── блик ────────────────────────────────────── */
    .shine {
        position: absolute;
        top: -50%;
        left: -120%;
        width: 60%;
        height: 200%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
        );
        transform: rotate(25deg);
        pointer-events: none;
    }

    .btn-action.visible .shine {
        animation: shine 0.9s 0.1s ease forwards;
    }

    @keyframes shine {
        from { left: -120%; }
        to   { left: 140%; }
    }

    /* ── label поверх всего ──────────────────────── */
    .label {
        position: relative;
        z-index: 1;
    }

    /* ── нажатие ─────────────────────────────────── */
    .btn-action:active:not(:disabled) {
        transform: scale(0.95);
        box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.04),
            0 4px 12px color-mix(in srgb, var(--accent) 25%, transparent);
    }

    /* ── disabled ────────────────────────────────── */
    .btn-action:disabled {
        background: var(--text-muted);
        box-shadow: none;
        opacity: 0.45;
        cursor: not-allowed;
        transform: none;
        animation: none;
    }

    .btn-action:disabled .glow,
    .btn-action:disabled .shine {
        display: none;
    }

    /* ── full width ──────────────────────────────── */
    .full-width {
        width: 100%;
    }
</style>
