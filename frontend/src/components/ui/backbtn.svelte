<!-- BackButton.svelte -->
<script lang="ts">
  import { t } from '$lib/i18n';

  export let label: string | null = null;
  export let iconOnly = false;
</script>

<button
  class="btn-back"
  class:icon-only={iconOnly}
  on:click
  aria-label={iconOnly ? (label ?? $t('common.back')) : undefined}
>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
  {#if !iconOnly}
    {label ?? $t('common.back')}
  {/if}
</button>

<style>
  .btn-back {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 10px 16px;
    border-radius: 12px;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .btn-back.icon-only {
    padding: 10px;
    width: 36px;
    height: 36px;
  }

  .btn-back:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-primary);
  }

  .btn-back:active {
    background: rgba(255, 255, 255, 0.1);
  }

  .btn-back:focus-visible {
    outline: 2px solid var(--accent, #fff);
    outline-offset: 2px;
  }
</style>