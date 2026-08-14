<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import BottomSheet from "$ui/BottomSheet.svelte";
  import { generateInviteToken } from "$api/family";
  import Icon from "@iconify/svelte";

  const dispatch = createEventDispatcher();

  // ─── State ───────────────────────────────────────────────────────────────

  let code = "";
  let expiresIn = 0;
  let loading = true;
  let error = false;
  let copied = false;

  // ─── Data fetching ───────────────────────────────────────────────────────

  onMount(loadCode);

  async function loadCode() {
    loading = true;
    error = false;
    try {
      const res = await generateInviteToken();
      code = res.invite_token;
      expiresIn = res.ttl; // секунды
    } catch (e) {
      console.error(e);
      error = true;
    } finally {
      loading = false;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function formatCode(raw: string): string {
    // "ABC123" → "ABC-123"
    return raw.length === 6 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw;
  }

  function formatExpiry(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} ч ${m} мин`;
    return `${m} мин`;
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(formatCode(code));
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // fallback для Android WebView
      const el = document.createElement("textarea");
      el.value = formatCode(code);
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    }
  }

  function close() {
    dispatch("close");
  }
</script>

<BottomSheet
  title="Пригласить участника"
  on:close={close}
  flyY={999}
  flyDuration={320}
>
  <div class="content">
    {#if loading}
      <div class="shimmer-wrap">
        <div class="shimmer-code"></div>
        <div class="shimmer-line"></div>
      </div>
    {:else if error}
      <div class="error-wrap">
        <p class="error-text">Не удалось получить код</p>
        <button class="retry-btn" on:click={loadCode}>Повторить</button>
      </div>
    {:else}
      <!-- Иллюстрация -->
      <div class="illustration">
        <div class="illustration-circles">
          <div class="circle c1">
            <Icon
              icon="material-symbols:person-rounded"
              width="48"
              height="48"
              style="color: var(--accent)"
            />
          </div>
          <div class="arrow">→</div>
          <div class="circle c2">
            <Icon
              icon="material-symbols:family-group-rounded"
              width="48"
              height="48"
              style="color: var(--accent)"
            />
          </div>
        </div>
      </div>

      <!-- Подсказка -->
      <p class="hint">
        Покажите этот код родственнику — он вводит его в приложении на экране
        «Семейный круг» чтобы присоединиться к вашей семье.
      </p>

      <!-- Код -->
      <button class="code-block" on:click={copyCode}>
        <span class="code-text">{formatCode(code)}</span>
        <span class="copy-hint">
          {#if copied}
            ✓ Скопировано
          {:else}
            Нажмите чтобы скопировать
          {/if}
        </span>
      </button>

      <!-- Срок действия -->
      <div class="expiry-row">
        <span class="expiry-icon">⏱</span>
        <span class="expiry-text">
          Код действует ещё <strong>{formatExpiry(expiresIn)}</strong>
        </span>
      </div>
    {/if}
  </div>
</BottomSheet>

<style>
  .content {
    padding: 8px 16px 8px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Illustration ───────────────────────── */
  .illustration {
    display: flex;
    justify-content: center;
    padding: 8px 0 0;
  }

  .illustration-circles {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .circle {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
  }

  .c1 {
    background: var(--bg-card, #332a1e);
  }
  .c2 {
    background: rgba(232, 168, 124, 0.15);
  }

  .arrow {
    font-size: 20px;
    color: var(--accent, #e8a87c);
  }

  /* ── Hint ───────────────────────── */
  .hint {
    font-size: 14px;
    color: var(--text-muted, rgba(255, 255, 255, 0.45));
    text-align: center;
    line-height: 1.5;
    margin: 0;
  }

  /* ── Code block ───────────────────────── */
  .code-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    background: var(--bg-card, #332a1e);
    border: 1.5px solid var(--accent, #e8a87c);
    border-radius: 18px;
    padding: 20px 16px;
    cursor: pointer;
    transition: opacity 0.15s;
    width: 100%;
  }

  .code-block:active {
    opacity: 0.7;
  }

  .code-text {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: 6px;
    color: var(--accent, #e8a87c);
    font-family: monospace;
  }

  .copy-hint {
    font-size: 12px;
    color: var(--text-muted, rgba(255, 255, 255, 0.35));
  }

  /* ── Expiry ───────────────────────── */
  .expiry-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .expiry-icon {
    font-size: 16px;
  }

  .expiry-text {
    font-size: 13px;
    color: var(--text-muted, rgba(255, 255, 255, 0.45));
  }

  .expiry-text strong {
    color: var(--text-primary, #fff);
    font-weight: 600;
  }
  /* ── Error ───────────────────────── */
  .error-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px 0;
  }

  .error-text {
    font-size: 14px;
    color: var(--text-muted, rgba(255, 255, 255, 0.45));
  }

  .retry-btn {
    background: none;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    padding: 8px 18px;
    font-size: 14px;
    font-family: inherit;
    color: var(--accent, #e8a87c);
    cursor: pointer;
  }

  /* ── Shimmer ───────────────────────── */
  .shimmer-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px 0;
  }

  .shimmer-code {
    width: 200px;
    height: 56px;
    border-radius: 14px;
    background: var(--bg-card, #332a1e);
    animation: shimmer 1.2s ease-in-out infinite;
  }

  .shimmer-line {
    width: 140px;
    height: 14px;
    border-radius: 6px;
    background: var(--bg-card, #332a1e);
    animation: shimmer 1.2s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
</style>
