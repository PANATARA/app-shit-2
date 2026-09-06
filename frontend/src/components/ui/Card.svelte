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
    <div
        class="glow glow-1"
        style="
        top: {glow.top}; bottom: {glow.bottom};
        left: {glow.left}; right: {glow.right};
    "
    />

    <div
        class="glow glow-2"
        style="
        top: {glow2.top}; bottom: {glow2.bottom};
        left: {glow2.left}; right: {glow2.right};
    "
    />

    {#if title || $$slots.action}
        <div class="card-head">
            {#if title}
                <span class="card-title">{title}</span>
            {/if}
            <slot name="action" />
        </div>
    {/if}

    <slot />
</div>

<style>
    .card {
        position: relative;
        overflow: hidden;

        display: flex;
        flex-direction: column;
        gap: 14px;

        padding: 18px;

        border-radius: 24px;

        background: linear-gradient(
            var(--gradient-angle, 180deg),
            color-mix(in srgb, var(--accent) 18%, var(--surface)),
            color-mix(in srgb, var(--accent) 4%, var(--surface))
        );

        box-shadow:
            0 4px 6px rgba(0, 0, 0, 0.04),
            0 12px 32px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    .glow {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        filter: blur(24px);
    }

    .glow-1 {
        width: 200px;
        height: 200px;
        background: color-mix(in srgb, var(--accent) 28%, transparent);
    }

    .glow-2 {
        width: 120px;
        height: 120px;
        background: color-mix(in srgb, var(--accent) 14%, transparent);
        opacity: 0.6;
    }

    .card-head {
        position: relative;
        z-index: 1;

        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .card-title {
        font-size: 13px;
        font-weight: 800;

        letter-spacing: 0.8px;
        text-transform: uppercase;

        color: var(--text-primary);
    }
</style>
