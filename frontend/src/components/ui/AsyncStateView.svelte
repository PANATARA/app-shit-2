<script lang="ts">
  import { t } from "$lib/i18n";

  export let loading = false;
  export let error = false;
  export let errorMessage: string | null = null;
  export let onRetry: (() => void) | null = null;
  export let shimmerCount = 4;
  export let empty = false;
  export let emptyMessage: string | null = null;
</script>

{#if loading}
  <div class="state-msg">
    <div class="shimmer-list">
      {#each Array(shimmerCount) as _}
        <div class="shimmer-item">
          <div class="shimmer-circle" />
          <div class="shimmer-line" />
        </div>
      {/each}
    </div>
  </div>
{:else if error}
  <div class="state-msg">
    <p class="state-text">{errorMessage ?? $t("common.load_error")}</p>
    {#if onRetry}
      <button class="retry-btn" on:click={onRetry}>
        {$t("common.retry")}
      </button>
    {/if}
  </div>
{:else if empty}
  <div class="state-msg">
    <p class="state-text">{emptyMessage ?? $t("common.empty")}</p>
  </div>
{:else}
  <slot />
{/if}

<style>
  .state-msg {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px 16px;
  }

  .state-text {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
  }

  .retry-btn {
    background: none;
    border: 1px solid var(--text-secondary);
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;
  }

  .retry-btn:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .retry-btn:focus-visible {
    outline: 2px solid var(--accent, #fff);
    outline-offset: 2px;
  }

  .shimmer-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .shimmer-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .shimmer-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 25%,
      rgba(255, 255, 255, 0.12) 37%,
      rgba(255, 255, 255, 0.06) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
  }

  .shimmer-line {
    flex: 1;
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 25%,
      rgba(255, 255, 255, 0.12) 37%,
      rgba(255, 255, 255, 0.06) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
</style>
