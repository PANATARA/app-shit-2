<script lang="ts">
  export let label: string = "Button";
  export let variant: "primary" | "secondary" | "ghost" | "danger" = "primary";
  export let disabled: boolean = false;

  export let onClick: () => void = () => {};
</script>

<button
  class="btn {variant}"
  class:disabled
  on:click={() => !disabled && onClick()}
  {disabled}
>
  <slot>{label}</slot>
</button>

<style>
  .btn {
    width: 100%;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    border: none;
    border-radius: var(--radius-sm, 14px);

    font-size: 15px;
    font-weight: 600;

    cursor: pointer;
    transition:
      transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.15s ease,
      background 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .btn:active:not(.disabled) {
    transform: scale(0.96);
  }

  /* PRIMARY */
  .primary {
    background: var(--surface-alt);
    color: var(--text-primary);
  }

  /* SECONDARY */
  .secondary {
    background: var(--surface-alt);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
  }

  /* GHOST */
  .ghost {
    background: transparent;
    color: var(--text-muted);
  }

  /* DANGER */
  .danger {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
  }

  /* DISABLED */
  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
</style>
