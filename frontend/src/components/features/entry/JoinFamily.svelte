<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade, slide } from "svelte/transition";

  import BackButton from "$ui/backbtn.svelte";
  import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";

  export let errorMessage = "";
  export let code = "";

  const dispatch = createEventDispatcher();
  function formatCode(value: string): string {
    const clean = value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);

    return clean.length > 3 ? `${clean.slice(0, 3)}-${clean.slice(3)}` : clean;
  }

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;

    code = formatCode(input.value);

    dispatch("codeChange", code);
  }
</script>

<div class="form-card">
  {#if errorMessage}
    <div class="error-toast" transition:slide={{ duration: 200 }}>
      <span>⚠️</span>
      {errorMessage}
    </div>
  {/if}

  <div class="join-form-pane">
    <p class="join-hint-text">
      Введите 6-значный пригласительный код вашей семьи.
    </p>

    <div class="code-entry-box">
      <label for="invite-code-input" class="code-input-label">
        Пригласительный код
      </label>

      <input
        id="invite-code-input"
        type="text"
        placeholder="AAA-000"
        bind:value={code}
        class="monospaced-code-input"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        on:input={handleInput}
      />

      <span class="code-subtext">
        Формат: три символа, дефис, три символа
      </span>
    </div>

    <ButtonPrimaryGlow
      label="Присоединиться →"
      on:click={() => dispatch("submit")}
    />

    <BackButton label="Назад" on:click={() => dispatch("back")} />
  </div>
</div>

<style>
  /* ── ОСНОВНАЯ КАРТОЧКА ФОРМЫ ── */
  .form-card {
    width: 100%;
    flex: 1;
    padding: 24px;
    position: relative;
  }

  .join-form-pane {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .join-hint-text {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  .code-entry-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    padding: 16px;
    border-radius: 16px;
  }

  .code-input-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .monospaced-code-input {
    width: 100%;
    box-sizing: border-box;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    font-family: "Courier New", Courier, monospace;
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 4px;
    text-align: center;
    color: var(--accent);
    text-transform: uppercase;
    transition: all 0.2s ease;
  }

  .monospaced-code-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--nav-active-bg);
  }

  .code-subtext {
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
  }

  /* ── ТОСТ ОШИБКИ ── */
  .error-toast {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 14px;
  }
</style>
