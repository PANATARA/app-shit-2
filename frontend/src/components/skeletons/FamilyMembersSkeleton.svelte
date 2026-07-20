<script lang="ts">
    export let membersCount = 5;
</script>

<div class="family-skeleton">
    <!-- Family header -->
    <div class="row">
        <div class="skeleton avatar"></div>

        <div class="row-text">
            <div class="skeleton line title"></div>

            <div class="skeleton line subtitle"></div>
        </div>
    </div>

    <div class="divider"></div>

    <!-- Members -->
    {#each Array(membersCount) as _}
        <div class="row">
            <div class="skeleton avatar small"></div>

            <div class="row-text">
                <div class="skeleton line member-name"></div>
            </div>

            <div class="skeleton arrow"></div>
        </div>
    {/each}

    <!-- Invite -->
    <div class="row">
        <div class="skeleton invite-icon"></div>

        <div class="row-text">
            <div class="skeleton line invite-text"></div>
        </div>

        <div class="skeleton arrow"></div>
    </div>
</div>

<style>
    .family-skeleton {
        width: 100%;
    }

    /* Общий ряд */
    .row {
        display: flex;
        align-items: center;
        gap: 12px;

        padding: 12px 14px;
    }

    /* Аватары */
    .avatar {
        width: 30px;
        height: 30px;

        border-radius: 50%;

        flex-shrink: 0;
    }

    .avatar.small {
        width: 30px;
        height: 30px;
    }

    /* Текст */
    .row-text {
        flex: 1;
    }

    .line {
        border-radius: 6px;
    }

    .title {
        width: 120px;
        height: 14px;
    }

    .subtitle {
        width: 80px;
        height: 11px;

        margin-top: 6px;
    }

    .member-name {
        width: 90px;
        height: 14px;
    }

    .invite-text {
        width: 160px;
        height: 14px;
    }

    /* Стрелка */
    .arrow {
        width: 10px;
        height: 16px;

        border-radius: 4px;
    }

    /* Пригласить */
    .invite-icon {
        width: 34px;
        height: 34px;

        border-radius: 10px;
    }

    /* Divider */
    .divider {
        height: 1px;

        margin: 4px 14px;

        background: var(--border);
    }

    /* Shimmer */

    .skeleton {
        background: linear-gradient(
            90deg,
            var(--surface-alt),
            var(--border),
            var(--surface-alt)
        );

        background-size: 200% 100%;

        animation: shimmer 1.4s infinite;
    }

    @keyframes shimmer {
        from {
            background-position: 200% 0;
        }

        to {
            background-position: -200% 0;
        }
    }
</style>
