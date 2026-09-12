<script lang="ts">
    export let title: string = "";
    export let glowDirection:
        "top-right" | "top-left" | "bottom-right" | "bottom-left" = "top-right";
    export let gradientDirection:
        "to-bottom" | "to-top" | "to-right" | "to-left" = "to-bottom";

    const gradientMap = {
        "to-bottom": "180deg",
        "to-top": "0deg",
        "to-right": "90deg",
        "to-left": "270deg",
    };

    const glowMap = {
        "top-right": {
            right: "-50px",
            top: "-50px",
            left: "auto",
            bottom: "auto",
        },
        "top-left": {
            left: "-50px",
            top: "-50px",
            right: "auto",
            bottom: "auto",
        },
        "bottom-right": {
            right: "-50px",
            bottom: "-50px",
            left: "auto",
            top: "auto",
        },
        "bottom-left": {
            left: "-50px",
            bottom: "-50px",
            right: "auto",
            top: "auto",
        },
    };

    // Второй блик — всегда в противоположном углу
    const glow2Map = {
        "top-right": {
            left: "-30px",
            bottom: "-30px",
            right: "auto",
            top: "auto",
        },
        "top-left": {
            right: "-30px",
            bottom: "-30px",
            left: "auto",
            top: "auto",
        },
        "bottom-right": {
            left: "-30px",
            top: "-30px",
            right: "auto",
            bottom: "auto",
        },
        "bottom-left": {
            right: "-30px",
            top: "-30px",
            left: "auto",
            bottom: "auto",
        },
    };

    $: angle = gradientMap[gradientDirection];
    $: glow = glowMap[glowDirection];
    $: glow2 = glow2Map[glowDirection];
</script>

<div class="card" style="--gradient-angle: {angle}deg;">
    {#if title || $$slots.action}
        <div class="card-head">
            {#if title}
                <span class="card-title">{title}</span>
            {/if}
            <slot name="action" />
        </div>
    {/if}

    <div class="card-body">
        <slot />
    </div>
</div>

<style>
    .card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 18px;
        width: 100%;
        box-sizing: border-box;
        border-radius: var(--radius-card, 22px);
        background: linear-gradient(
            var(--gradient-angle, 180deg),
            color-mix(in srgb, var(--accent) 8%, var(--surface)) 0%,
            var(--surface) 100%
        );
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-card);
        transition: transform 0.16s ease, box-shadow 0.2s ease;
    }

    .card-head {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        box-sizing: border-box;
    }

    .card-title {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .card-body {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }
</style>
