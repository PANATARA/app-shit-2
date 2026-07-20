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
    border-radius: 14px;

    font-size: 15px;
    font-weight: 700;

    cursor: pointer;
    transition:
      transform 0.15s ease,
      opacity 0.15s ease;
  }

  /* PRIMARY */
  .primary {
    background: var(--surface-alt);
    color: var(--text-primary);
  }

  /* DANGER */
  .danger {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }

  /* DISABLED */
  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
</style>
