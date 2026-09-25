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
        background: rgba(0, 0, 0, 0.42);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        z-index: 100;
        -webkit-tap-highlight-color: transparent;
    }

    .sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 101;
        background: var(--surface);
        border-top: 0.5px solid var(--border-subtle);
        border-radius: 28px 28px 0 0;
        box-shadow: 0 -8px 36px -4px rgba(0, 0, 0, 0.16);
        display: flex;
        flex-direction: column;
        max-height: 90vh;
    }

    .sheet-handle-only {
        padding: 12px 0 8px;
        display: flex;
        justify-content: center;
        flex-shrink: 0;
    }

    .sheet-header {
        padding: 12px 0 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }

    .sheet-handle {
        width: 36px;
        height: 5px;
        background: var(--text-muted);
        border-radius: 999px;
        opacity: 0.32;
    }

    .sheet-title {
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
        font-size: 17px;
        font-weight: 600;
        letter-spacing: -0.3px;
        color: var(--text-primary);
        text-align: center;
        padding: 0 16px 2px;
    }

    .sheet-content {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        min-height: 0;
        padding-bottom: calc(20px + env(safe-area-inset-bottom));
    }
</style>
