<!-- BackButton.svelte -->
<script lang="ts">
  export let label = "Назад";
</script>

<button class="btn-back" on:click>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
  {label}
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
  }

  .btn-back:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-primary);
  }

  .btn-back:active {
    background: rgba(255, 255, 255, 0.1);
  }
</style>