<script lang="ts">
    import { activeTab } from "$lib/navigation";
    import Icon from "@iconify/svelte";

    function choose(type: "create" | "join") {
        activeTab.set(
            type === "create" ? "onboardingCreateStep1" : "onboardingJoin",
        );
    }
</script>

<div class="onboarding-screen">
    <!-- <header class="onboarding-header">
        <BackButton on:click={() => activeTab.set("onboardingWelcome")} />

        <h2 class="screen-title">Семейный круг</h2>
    </header> -->

    <main class="content">
        <section class="intro">
            <div class="intro-icon">
                <Icon
                    icon="material-symbols:family-home-rounded"
                    width="34"
                    height="34"
                />
            </div>

            <div class="intro-text">
                <h1>Как начнём?</h1>

                <p>
                    Создайте новое семейное пространство или присоединитесь к
                    уже существующему.
                </p>
            </div>
        </section>

        <section class="choose-options">
            <button
                class="choose-card"
                type="button"
                on:click={() => choose("create")}
            >
                <div class="choose-icon">
                    <Icon
                        icon="material-symbols:add-home-rounded"
                        width="28"
                        height="28"
                    />
                </div>

                <div class="choose-content">
                    <span class="choose-label">Новая семья</span>

                    <strong>Создать семью</strong>

                    <p>Создайте пространство для семьи и пригласите близких.</p>
                </div>

                <div class="arrow">
                    <Icon
                        icon="material-symbols:chevron-right-rounded"
                        width="23"
                        height="23"
                    />
                </div>
            </button>

            <button
                class="choose-card"
                type="button"
                on:click={() => choose("join")}
            >
                <div class="choose-icon">
                    <Icon
                        icon="material-symbols:handshake-rounded"
                        width="30"
                        height="30"
                    />
                </div>

                <div class="choose-content">
                    <span class="choose-label">Уже есть семья?</span>

                    <strong>Присоединиться</strong>

                    <p>Введите код приглашения, который отправил член семьи.</p>
                </div>

                <div class="arrow">
                    <Icon
                        icon="material-symbols:chevron-right-rounded"
                        width="23"
                        height="23"
                    />
                </div>
            </button>
        </section>

        <div class="bottom-hint">
            <Icon
                icon="material-symbols:lock-outline-rounded"
                width="16"
                height="16"
            />

            <span
                >Ваше семейное пространство доступно только его участникам</span
            >
        </div>
    </main>
</div>

<style>
    .onboarding-screen {
        width: 100%;
        min-height: 100dvh;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        background: var(--bg);
        color: var(--text-primary);
    }

    /* ───────────────── Header ───────────────── */

    .onboarding-header {
        display: flex;
        align-items: center;
        gap: 12px;

        padding: 56px 20px 10px;
    }

    .screen-title {
        margin: 0;

        font-size: 20px;
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: -0.35px;

        color: var(--text-primary);
    }

    /* ───────────────── Content ───────────────── */

    .content {
        width: 100%;
        max-width: 520px;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        margin: 0 auto;
        padding: 28px 20px 28px;
    }

    /* ───────────────── Intro ───────────────── */

    .intro {
        display: flex;
        flex-direction: column;
        align-items: center;

        text-align: center;

        margin-bottom: 30px;
    }

    .intro-icon {
        width: 68px;
        height: 68px;

        display: flex;
        align-items: center;
        justify-content: center;

        margin-bottom: 18px;

        border-radius: 21px;

        color: var(--accent);

        background: color-mix(in srgb, var(--accent) 13%, transparent);

        border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);

        box-shadow:
            0 10px 28px color-mix(in srgb, var(--accent) 10%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .intro-text h1 {
        margin: 0 0 8px;

        font-size: 27px;
        line-height: 1.15;
        font-weight: 800;
        letter-spacing: -0.7px;

        color: var(--text-primary);
    }

    .intro-text p {
        max-width: 370px;

        margin: 0 auto;

        font-size: 14px;
        line-height: 1.55;

        color: var(--text-secondary);
    }

    /* ───────────────── Cards ───────────────── */

    .choose-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .choose-card {
        position: relative;

        width: 100%;
        min-height: 128px;

        box-sizing: border-box;

        display: flex;
        align-items: center;
        gap: 14px;

        padding: 16px;

        border: 1px solid var(--border);
        border-radius: 20px;

        background: var(--surface-secondary);

        color: inherit;

        cursor: pointer;
        text-align: left;

        -webkit-tap-highlight-color: transparent;

        transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
    }

    .choose-card:hover {
        border-color: color-mix(in srgb, var(--accent) 35%, var(--border));

        background: color-mix(
            in srgb,
            var(--surface-secondary) 94%,
            var(--accent)
        );

        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .choose-card:active {
        transform: scale(0.985);
    }

    /* ───────────────── Card Icon ───────────────── */

    .choose-icon {
        flex: 0 0 52px;

        width: 52px;
        height: 52px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 16px;

        color: white;

        background: linear-gradient(
            145deg,
            var(--accent),
            color-mix(in srgb, var(--accent) 72%, white)
        );

        box-shadow: 0 6px 16px
            color-mix(in srgb, var(--accent) 18%, transparent);
    }

    /* ───────────────── Card Content ───────────────── */

    .choose-content {
        min-width: 0;
        flex: 1;

        display: flex;
        flex-direction: column;
    }

    .choose-label {
        margin-bottom: 3px;

        font-size: 10px;
        line-height: 1.2;
        font-weight: 700;

        letter-spacing: 0.07em;
        text-transform: uppercase;

        color: var(--accent);
    }

    .choose-content strong {
        display: block;

        margin-bottom: 5px;

        font-size: 16px;
        line-height: 1.2;
        font-weight: 750;

        color: var(--text-primary);
    }

    .choose-content p {
        margin: 0;

        font-size: 12px;
        line-height: 1.4;

        color: var(--text-secondary);
    }

    /* ───────────────── Arrow ───────────────── */

    .arrow {
        flex: 0 0 30px;

        width: 30px;
        height: 30px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 10px;

        color: var(--accent);

        background: color-mix(in srgb, var(--accent) 8%, transparent);

        transition:
            transform 0.18s ease,
            background 0.18s ease;
    }

    .choose-card:hover .arrow {
        transform: translateX(2px);

        background: color-mix(in srgb, var(--accent) 14%, transparent);
    }

    /* ───────────────── Bottom hint ───────────────── */

    .bottom-hint {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        margin-top: 22px;
        padding: 0 12px;

        text-align: center;

        font-size: 11px;
        line-height: 1.4;

        color: var(--text-secondary);
        opacity: 0.55;
    }

    .bottom-hint :global(svg) {
        flex-shrink: 0;
    }

    /* ───────────────── Small screens ───────────────── */

    @media (max-width: 380px) {
        .onboarding-header {
            padding-top: 48px;
        }

        .content {
            padding: 24px 16px 24px;
        }

        .intro {
            margin-bottom: 24px;
        }

        .intro-icon {
            width: 60px;
            height: 60px;
            margin-bottom: 15px;
            border-radius: 19px;
        }

        .intro-text h1 {
            font-size: 25px;
        }

        .intro-text p {
            font-size: 13px;
        }

        .choose-card {
            min-height: 118px;
            padding: 14px;
            border-radius: 18px;
        }

        .choose-icon {
            flex-basis: 48px;
            width: 48px;
            height: 48px;
            border-radius: 14px;
        }

        .choose-content strong {
            font-size: 15px;
        }

        .choose-content p {
            font-size: 11px;
        }
    }
</style>
