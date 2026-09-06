<script lang="ts">
    import Icon from "@iconify/svelte";
    import Card from "$ui/Card.svelte";
</script>

<div class="screen">
    <Card glowDirection="top-left" gradientDirection="to-right">
        <div class="placeholder">
            <div class="icon-wrap">
                <Icon
                    icon="material-symbols:explore-outline-rounded"
                    width="48"
                    height="48"
                />
            </div>
            <h2>Карта дома</h2>
            <p>
                Интерактивная карта комнат и зон находится в разработке. Скоро здесь можно будет привязывать дела к локациям в доме.
            </p>
        </div>
    </Card>
</div>

<style>
    .screen {
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: calc(100vh - 120px);
    }

    .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 32px 16px;
        gap: 12px;
    }

    .icon-wrap {
        width: 80px;
        height: 80px;
        border-radius: 24px;
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
    }

    h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
        color: var(--text-primary);
    }

    p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-secondary);
        max-width: 280px;
    }
</style>
