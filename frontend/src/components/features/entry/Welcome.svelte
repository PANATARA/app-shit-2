<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";

    const dispatch = createEventDispatcher();
</script>

<div class="first-info">
  <div class="icon-wrap">🏠</div>
  <h2 class="title">Семейный круг</h2>
  <p class="subtitle">
    Организуйте быт вместе — задания, привычки и награды для всей семьи
  </p>
  <div class="pills">
    <div class="pill"><span>👥</span> До 10 участников</div>
    <div class="pill"><span>🛡️</span> Только для своих</div>
    <div class="pill"><span>🔄</span> Синхронизация</div>
  </div>
  <ButtonPrimaryGlow label={"Продолжить →"} on:click={() => dispatch("continue")}/>
</div>

<style>
  .first-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 24px 0;
    margin-bottom: 24px;
  }

  .icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    background: rgba(210, 140, 90, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 24px;
    font-weight: 800;
    color: var(--text-primary);
    text-align: center;
    margin: 0 0 6px;
    letter-spacing: -0.5px;
  }

  .subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    text-align: center;
    margin: 0 0 20px;
    line-height: 1.5;
  }

  .pills {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }

  .pill {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.07);
    border: 0.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  
</style>
