<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { onMount, onDestroy } from "svelte";
    import { registerModal } from "$lib/navigation";

    let portal: HTMLDivElement;
    let unregisterModal: (() => void) | null = null;

    onMount(() => {
        document.body.appendChild(portal);
        unregisterModal = registerModal(close);
    });

    onDestroy(() => {
        if (unregisterModal) {
            unregisterModal();
        }
        if (portal && portal.parentNode) {
            portal.parentNode.removeChild(portal);
        }
    });

    export let title = "";
    export let flyY = 300;
    export let flyDuration = 280;

    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }
</script>

<div bind:this={portal}>
    <div
        class="backdrop"
        role="button"
        tabindex="0"
        on:click={close}
        on:keydown={(e) => e.key === "Escape" && close()}
        transition:fade={{ duration: 250 }}
    ></div>

    <div
        class="sheet"
        transition:fly={{ y: flyY, duration: flyDuration, opacity: 1 }}
    >
        {#if title}
            <div class="sheet-header">
                <div class="sheet-handle"></div>
                <div class="sheet-title">{title}</div>
            </div>
        {:else}
            <div class="sheet-handle-only">
                <div class="sheet-handle"></div>
            </div>
        {/if}

        <div class="sheet-content">
            <slot />
        </div>
    </div>
</div>

<style>
    .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 12, 18, 0.45);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 100;
    }

    .sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 101;
        background: var(--surface);
        border-top: 1px solid var(--border-subtle);
        border-radius: var(--radius-modal, 28px) var(--radius-modal, 28px) 0 0;
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.18);
        display: flex;
        flex-direction: column;
        max-height: 90vh;
    }

    .sheet-handle-only {
        padding: 14px 0 8px;
        display: flex;
        justify-content: center;
        flex-shrink: 0;
    }

    .sheet-header {
        padding: 14px 0 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
    }

    .sheet-handle {
        width: 38px;
        height: 4.5px;
        background: var(--text-muted);
        border-radius: 999px;
        opacity: 0.28;
    }

    .sheet-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
        padding: 0 16px 4px;
        letter-spacing: -0.2px;
    }

    .sheet-content {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding-bottom: max(24px, env(safe-area-inset-bottom));
    }
</style>
