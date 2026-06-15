<script lang="ts">
  export let label: string = "Button";
  export let variant: "primary" | "ghost" | "danger" = "primary";
  export let disabled: boolean = false;

  export let onClick: () => void = () => {};
</script>

<button
  class="btn {variant}"
  class:disabled
  on:click={() => !disabled && onClick()}
  disabled={disabled}
>
  <slot>{label}</slot>
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 10px 14px;
    border-radius: 14px;

    font-size: 13px;
    font-weight: 600;

    cursor: pointer;
    transition: 0.15s ease;

    user-select: none;
    border: 1px solid transparent;
  }

  /* PRIMARY */
  .primary {
    background: #22c55e;
    color: #0b0f0c;
    box-shadow: 0 6px 18px rgba(34, 197, 94, 0.15);
  }

  .primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(34, 197, 94, 0.22);
  }

  .primary:active {
    transform: scale(0.96);
  }

  /* GHOST */
  .ghost {
    background: rgba(255, 255, 255, 0.04);
    color: #e5e7eb;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .ghost:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-1px);
  }

  .ghost:active {
    transform: scale(0.96);
  }

  /* DANGER */
  .danger {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .danger:hover {
    background: rgba(239, 68, 68, 0.22);
    transform: translateY(-1px);
  }

  .danger:active {
    transform: scale(0.96);
  }

  /* DISABLED */
  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
</style>