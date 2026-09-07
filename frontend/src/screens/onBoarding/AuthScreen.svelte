<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { requestCode, verifyCode, debugAuth } from "$api/auth";
  import { t } from "$lib/i18n";

  const dispatch = createEventDispatcher();

  type Step = "email" | "code";

  let step: Step = "email";
  let email = "";
  let code = "";
  let loading = false;
  let error = "";

  async function handleRequestCode() {
    if (!email.trim()) {
      error = $t.auth.enterEmailError;
      return;
    }
    error = "";
    loading = true;
    try {
      await requestCode(email.trim());
      step = "code";
    } catch (e: any) {
      error = e?.message ?? $t.auth.sendCodeError;
    } finally {
      loading = false;
    }
  }

  async function handleVerifyCode() {
    if (!code.trim()) {
      error = $t.auth.enterCode;
      return;
    }
    error = "";
    loading = true;
    try {
      await verifyCode(email.trim(), parseInt(code.trim(), 10));
      dispatch("auth");
    } catch (e: any) {
      error = e?.message ?? $t.auth.invalidCodeError;
    } finally {
      loading = false;
    }
  }

  async function handleDebugAuth() {
    const debugEmail = email.trim() || "debug@dev.local";
    error = "";
    loading = true;
    try {
      await debugAuth(debugEmail);
      dispatch("auth");
    } catch (e: any) {
      error = e?.message ?? $t.auth.debugAuthError;
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      step === "email" ? handleRequestCode() : handleVerifyCode();
    }
  }
</script>

<div class="page">
  <div class="card">
    <div class="logo">🏠</div>

    {#if step === "email"}
      <h1 class="title">{$t.auth.welcome}</h1>
      <p class="subtitle">{$t.auth.enterEmail}</p>

      <div class="field">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="field-label">{$t.auth.emailLabel}</label>
        <input
          class="field-input"
          type="email"
          placeholder={$t.auth.emailPlaceholder}
          bind:value={email}
          on:keydown={handleKeydown}
          autocomplete="email"
          disabled={loading}
        />
      </div>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button
        class="btn-primary"
        on:click={handleRequestCode}
        disabled={loading}
      >
        {loading ? $t.auth.sending : $t.auth.sendCode}
      </button>
    {:else}
      <h1 class="title">{$t.auth.checkEmail}</h1>
      <p class="subtitle">{$t.auth.codeSentTo} <strong>{email}</strong></p>

      <div class="field">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="field-label">{$t.auth.codeLabel}</label>
        <input
          class="field-input code-input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="000000"
          bind:value={code}
          on:keydown={handleKeydown}
          maxlength="6"
          disabled={loading}
        />
      </div>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button
        class="btn-primary"
        on:click={handleVerifyCode}
        disabled={loading}
      >
        {loading ? $t.auth.verifying : $t.auth.login}
      </button>

      <button
        class="btn-ghost"
        on:click={() => {
          step = "email";
          code = "";
          error = "";
        }}
        disabled={loading}
      >
        {$t.auth.changeEmail}
      </button>
    {/if}

    <div class="debug-block">
      <div class="debug-divider">
        <span>debug</span>
      </div>
      <button class="btn-debug" on:click={handleDebugAuth} disabled={loading}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
          <path d="M12 8v4l3 3" />
        </svg>
        {$t.auth.loginWithoutCode} {email ? `(${email})` : "(debug@dev.local)"}
      </button>
    </div>
  </div>
</div>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .page {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  }

  .card {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .logo {
    font-size: 48px;
    text-align: center;
    margin-bottom: 4px;
  }

  .title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    text-align: center;
  }

  .subtitle {
    font-size: 14px;
    color: var(--text-muted);
    text-align: center;
    line-height: 1.5;
  }

  .subtitle strong {
    color: var(--text-secondary);
    font-weight: 600;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 4px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .field-input {
    background: var(--surface-alt);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 13px 16px;
    color: var(--text-primary);
    font-size: 16px;
    font-family: inherit;
    outline: none;
    width: 100%;
    transition: border-color 0.15s;
  }

  .field-input:focus {
    border-color: var(--accent);
  }
  .field-input:disabled {
    opacity: 0.5;
  }

  .code-input {
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 8px;
  }

  .error {
    font-size: 13px;
    color: #ff3b30;
    text-align: center;
  }

  .btn-primary {
    width: 100%;
    padding: 15px;
    background: var(--accent);
    border: none;
    border-radius: 16px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
    margin-top: 4px;
  }

  .btn-primary:active {
    opacity: 0.8;
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-ghost {
    width: 100%;
    padding: 12px;
    background: none;
    border: none;
    color: var(--accent);
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-ghost:active {
    opacity: 0.6;
  }
  .btn-ghost:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .debug-block {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .debug-divider {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .debug-divider::before,
  .debug-divider::after {
    content: "";
    flex: 1;
    height: 0.5px;
    background: var(--border);
  }

  .debug-divider span {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
  }

  .btn-debug {
    width: 100%;
    padding: 11px 14px;
    background: var(--surface-alt);
    border: 1px dashed var(--border);
    border-radius: 12px;
    color: var(--text-muted);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: opacity 0.15s;
  }

  .btn-debug:active {
    opacity: 0.6;
  }
  .btn-debug:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
