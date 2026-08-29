<!-- ProgressBar.svelte -->
<script lang="ts">
    export let percent: number;
    export let label: string = "";
    export let sublabel: string = "";
    export let shimmer: boolean = true;
</script>

{#if label || sublabel}
    <div class="progress-info">
        {#if label}<span class="progress-label">{label}</span>{/if}
        {#if sublabel}<span class="progress-sublabel">{sublabel}</span>{/if}
    </div>
{/if}

<div class="progress-track">
    <div class="progress-fill" style="transform: scaleX({percent / 100})">
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
        margin-bottom: 8px;
    }

    .progress-label {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
    }

    .progress-sublabel {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
    }

    .progress-track {
        position: relative;
        height: 10px;
        border-radius: 999px;
        background: var(--surface-alt);
        overflow: hidden;
    }

    .progress-fill {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
            90deg,
            var(--accent) 0%,
            var(--success) 100%
        );
        transform-origin: left center;
        transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1);
        will-change: transform;
        overflow: hidden;
    }

    .progress-shimmer {
        position: absolute;
        inset: 0;
        /* Узкий, чёткий блик — как на iOS */
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.0) 30%,
            rgba(255, 255, 255, 0.45) 50%,
            rgba(255, 255, 255, 0.0) 70%,
            transparent 100%
        );
        animation: shimmer 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        will-change: transform;
    }

    @keyframes shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
</style>
