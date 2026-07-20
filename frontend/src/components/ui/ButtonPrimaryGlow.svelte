<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { onMount } from "svelte";

    export let label = "Продолжить";
    export let disabled = false;
    export let fullWidth = false;

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
            {
                threshold: 0.2,
            },
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
    {label}
</button>

<style>
    .btn-action {
        position: relative;
        overflow: hidden;

        background: var(--accent);
        color: var(--bg);

        border: none;
        padding: 14px 20px;

        border-radius: 14px;

        font-size: 15px;
        font-weight: 800;

        cursor: pointer;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        opacity: 0;
        transform: translateY(20px) scale(0.97);

        -webkit-tap-highlight-color: transparent;

        transition:
            opacity 0.35s ease,
            transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
            filter 0.2s ease;
    }

    /* появление */
    .btn-action.visible {
        opacity: 1;
        transform: translateY(0) scale(1);

        animation: button-enter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes button-enter {
        0% {
            transform: translateY(20px) scale(0.97);
        }

        70% {
            transform: translateY(-3px) scale(1.02);
        }

        100% {
            transform: translateY(0) scale(1);
        }
    }

    /* блик при появлении */
    .btn-action::after {
        content: "";

        position: absolute;

        top: -50%;
        left: -120%;

        width: 80%;
        height: 200%;

        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.35),
            transparent
        );

        transform: rotate(25deg);
    }

    .btn-action.visible::after {
        animation: shine 0.8s ease forwards;
    }

    @keyframes shine {
        from {
            left: -120%;
        }

        to {
            left: 140%;
        }
    }

    /* эффект нажатия */
    .btn-action:active:not(:disabled) {
        transform: scale(0.95);
    }

    /* disabled */
    .btn-action:disabled {
        background: var(--text-muted);
        opacity: 0.45;

        cursor: not-allowed;

        transform: none;
        animation: none;
    }

    .btn-action:disabled::after {
        display: none;
    }

    /* на всю ширину */
    .full-width {
        width: 100%;
    }
</style>
