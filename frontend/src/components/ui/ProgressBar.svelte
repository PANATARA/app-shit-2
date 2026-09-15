<!-- ProgressBar.svelte -->
<script lang="ts">
    export let percent: number;
    export let label: string = "";
    export let sublabel: string = "";
    export let shimmer: boolean = true;
    export let height: number = 8;
</script>

{#if label || sublabel}
    <div class="progress-info">
        {#if label}<span class="progress-label">{label}</span>{/if}
        {#if sublabel}<span class="progress-sublabel">{sublabel}</span>{/if}
    </div>
{/if}

<div class="progress-track" style="height: {height}px;">
    <div
        class="progress-fill"
        style="transform: scaleX({Math.min(Math.max(percent ?? 0, 0), 100) / 100})"
    >
        {#if shimmer}
            <div class="progress-shimmer"></div>
        {/if}
    </div>
</div>

<style>
    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
    }

    .progress-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        letter-spacing: -0.2px;
    }

    .progress-sublabel {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
    }

    .progress-track {
        position: relative;
        border-radius: var(--radius-pill, 999px);
        background: color-mix(in srgb, var(--accent) 12%, var(--surface-alt));
        overflow: hidden;
    }

    .progress-fill {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: var(--accent-gradient, var(--accent));
        box-shadow: 0 1px 4px color-mix(in srgb, var(--accent) 20%, transparent);
        transform-origin: left center;
        transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1);
        will-change: transform;
        overflow: hidden;
    }

    .progress-shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.0) 25%,
            rgba(255, 255, 255, 0.22) 50%,
            rgba(255, 255, 255, 0.0) 75%,
            transparent 100%
        );
        animation: shimmer 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        will-change: transform;
    }

    @keyframes shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
</style>
