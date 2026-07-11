<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label = "Продолжить";

  const dispatch = createEventDispatcher();
</script>

<button class="btn-action primary-glow" on:click={() => dispatch("click")}>
  {label}
</button>

<style>
  /* ── КНОПКИ ДЕЙСТВИЯ ── */
  .btn-action {
    background: var(--accent);
    color: var(--bg);
    border: none;
    padding: 14px 20px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-action:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.95;
  }

  .btn-action:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .primary-glow {
    position: relative;
    overflow: hidden;
  }

  .primary-glow::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    transform: rotate(45deg);
    transition: left 0.7s ease;
  }

  .primary-glow:hover::after {
    left: 120%;
  }
</style>
