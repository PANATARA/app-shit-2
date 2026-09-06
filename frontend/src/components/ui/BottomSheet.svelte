<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fly, fade } from "svelte/transition";
    import { onMount, onDestroy } from "svelte";

    let portal: HTMLDivElement;

    onMount(() => {
        document.body.appendChild(portal);
    });

    onDestroy(() => {
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
        background: rgba(0, 0, 0, 0.5);
        z-index: 100;
    }

    .sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 101;
        background: var(--bg);
        border-radius: 20px 20px 0 0;
        display: flex;
        flex-direction: column;
        max-height: 90vh;
    }

    .sheet-handle-only {
        padding: 16px 0 8px;
        display: flex;
        justify-content: center;
        flex-shrink: 0;
    }

    .sheet-header {
        padding: 16px 0 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }

    .sheet-handle {
        width: 36px;
        height: 4px;
        background: var(--text-muted);
        border-radius: 2px;
        opacity: 0.4;
    }

    .sheet-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        text-align: center;
        padding: 0 16px 8px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
    }

    .sheet-content {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding-bottom: max(24px, env(safe-area-inset-bottom));
    }
</style>
