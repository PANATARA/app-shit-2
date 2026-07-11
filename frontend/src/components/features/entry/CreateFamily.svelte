<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  import BackButton from "$ui/backbtn.svelte";
  import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";
  import CustomInput from "$ui/CustomInput.svelte";

  export let errorMessage = "";
  export let familyName = "";

  const dispatch = createEventDispatcher();

  function handleNameChange(value: string) {
    familyName = value;
    dispatch("nameChange", value);
  }
</script>

<div class="form-card">
  {#if errorMessage}
    <div class="error-toast" transition:slide={{ duration: 200 }}>
      <span>⚠️</span>
      {errorMessage}
    </div>
  {/if}

  <div class="form-section">
    <h3>Как назовём вашу семью?</h3>

    <p class="step-desc">
      Это название будут видеть все участники вашего семейного круга.
    </p>

    <CustomInput
      value={familyName}
      on:inputChange={(e) => handleNameChange(e.detail)}
      icon="🏡"
      placeholder="Например: Супер Семейка"
      maxlength={36}
    />

    <div class="form-tips">
      <span class="tip-dot">•</span>
      <p>Позже название можно изменить в настройках.</p>
    </div>

    <ButtonPrimaryGlow label="Продолжить →" on:click={() => dispatch("next")} />

    <BackButton label="Назад" on:click={() => dispatch("back")} />
  </div>
</div>

<style>
  .form-card {
    width: 100%;
    flex: 1;
    padding: 24px;
    position: relative;
  }
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
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .step-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 4px 0 16px;
  }
  .form-tips {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }

  .tip-dot {
    color: var(--accent);
    font-weight: bold;
  }

  .form-tips p {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }
</style>
