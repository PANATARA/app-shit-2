<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";

  const dispatch = createEventDispatcher();

  function choose(type: "create" | "join") {
    dispatch("choose", { type });
  }
</script>

<div class="choose-options">
  <button class="choose-card" on:click={() => choose("create")}>
    <div class="choose-icon">
      <Icon
        class="choose-arrow"
        icon="material-symbols:add-home-rounded"
        width="28"
        height="28"
        color="white"
      />
    </div>

    <div class="choose-content">
      <strong>Создать семью</strong>
      <p>Создайте новое семейное пространство и пригласите близких.</p>
    </div>

    <Icon
      class="choose-arrow"
      icon="material-symbols:chevron-right-rounded"
      width="28"
      height="28"
      color="var(--accent)"
    />
  </button>

  <button class="choose-card" on:click={() => choose("join")}>
    <div class="choose-icon">
      <Icon
        icon="material-symbols:handshake-rounded"
        width="32"
        height="32"
        color="white"
      />
    </div>

    <div class="choose-content">
      <strong>Присоединиться</strong>
      <p>Введите код приглашения, полученный от члена семьи.</p>
    </div>

    <Icon
      class="choose-arrow"
      icon="material-symbols:chevron-right-rounded"
      width="28"
      height="28"
      color="var(--accent)"
    />
  </button>
</div>

<style>
  .choose-options {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    padding: 24px;
    width: 100%;
  }

  .choose-card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 18px;

    background: var(--surface-secondary);

    cursor: pointer;
    text-align: left;

    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      background 0.18s ease,
      box-shadow 0.18s ease;
  }

  .choose-icon {
    flex-shrink: 0;

    width: 54px;
    height: 54px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 16px;

    background: linear-gradient(
      145deg,
      var(--accent),
      color-mix(in srgb, var(--accent) 70%, white)
    );

    font-size: 28px;
  }

  .choose-content {
    flex: 1;
  }

  .choose-content strong {
    display: block;
    margin-bottom: 4px;

    font-size: 17px;
    font-weight: 700;

    color: var(--text-primary);
  }

  .choose-content p {
    margin: 0;

    color: var(--text-secondary);

    line-height: 1.45;
    font-size: 14px;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0) rotate(0);
    }
    50% {
      transform: translateY(-3px) rotate(15deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes ping {
    0% {
      transform: scale(1);
      opacity: 0.2;
    }
    80%,
    100% {
      transform: scale(2.2);
      opacity: 0;
    }
  }

  @keyframes heartbeat {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @keyframes loadFill {
    0% {
      transform: scaleX(0);
    }
    50% {
      transform: scaleX(0.7);
    }
    100% {
      transform: scaleX(1);
    }
  }

  @keyframes laserScan {
    0% {
      top: 8%;
      opacity: 0.4;
    }
    50% {
      top: 92%;
      opacity: 1;
    }
    100% {
      top: 8%;
      opacity: 0.4;
    }
  }

  @keyframes flash {
    0% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes radialGlowPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(213, 138, 114, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(213, 138, 114, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(213, 138, 114, 0);
    }
  }

  @keyframes floatSparkle {
    0%,
    100% {
      transform: translateY(0) scale(1) rotate(0deg);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-10px) scale(1.2) rotate(15deg);
      opacity: 0.9;
    }
  }

  @keyframes popIn {
    0% {
      transform: scale(0.4);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes checkScale {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
