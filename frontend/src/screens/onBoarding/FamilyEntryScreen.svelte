<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade, scale } from "svelte/transition";

  import BackButton from "$ui/backbtn.svelte";
  import ButtonPrimaryGlow from "$ui/ButtonPrimaryGlow.svelte";

  import { createFamily, joinFamily } from "$api/family";
  import AvatarConstructor from "$features/settings/AvatarConstructor.svelte";
  import Welcome from "$features/entry/Welcome.svelte";
  import ChooseFamilyEntry from "$features/entry/ChooseFamilyEntry.svelte";
  import CreateFamily from "$features/entry/CreateFamily.svelte";
  import JoinFamily from "$features/entry/JoinFamily.svelte";

  import type { FamilyCreateForm, FamilyProfile } from "$types/index";
  import Icon from "@iconify/svelte";

  const dispatch = createEventDispatcher();

  // ─── Types ───────────────────────────────────────────────────────────────────

  type CreateOrJoin = "create" | "join";

  // ─── Slides ───────────────────────────────────────────────────────────────

  const SLIDES = {
    welcome: 0,
    choose: 1,
    createOrJoin: 2,
    createStep2: 3,
  } as const;

  // ─── State ───────────────────────────────────────────────────────────────────

  let slideIndex = SLIDES.welcome;

  let createOrJoin: CreateOrJoin = "create";

  let familyForm: FamilyCreateForm = {
    name: "",
    icon: "material-symbols:family-group",
    icon_color: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
    icon_bg: "linear-gradient(135deg, #413a34 0%, #2b2622 100%)",
  };

  let codeInputRaw = "";

  // ─── UI State ──────────────────────────────────────────────────────────────
  let isLoading = false;
  let loadingText = "";
  let isSuccess = false;
  let successData: FamilyProfile | null = null;
  let errorMessage = "";

  // ─── Navigation ──────────────────────────────────────────────────────────────

  function goTo(slide: number) {
    errorMessage = "";
    slideIndex = slide;
  }

  function handleChoose(type: CreateOrJoin) {
    createOrJoin = type;
    goTo(SLIDES.createOrJoin);
  }

  function handleProceedToApp() {
    dispatch("success", { family: successData });
  }

  // ─── Create family ───────────────────────────────────────────────────────────

  function handleNextStep() {
    if (!familyForm.name.trim()) {
      errorMessage = "Пожалуйста, введите название вашей семьи";
      return;
    }
    errorMessage = "";
    goTo(SLIDES.createStep2);
  }

  async function handleFinishCreate() {
    isLoading = true;
    loadingText = "Регистрация семейного пространства...";
    errorMessage = "";

    try {
      const [profile] = await Promise.all([
        createFamily(familyForm),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      successData = profile;
      isSuccess = true;
      isSuccess = true;
    } catch {
      errorMessage = "Не удалось создать семью. Попробуйте еще раз.";
    } finally {
      isLoading = false;
    }
  }

  // ─── Join family ─────────────────────────────────────────────────────────────

  async function handleJoinByCode() {
    codeInputRaw = codeInputRaw.replace("-", "");
    if (codeInputRaw.length < 6) {
      errorMessage = "Введите полный 6-значный код (например, ABC-123)";
      return;
    }

    isLoading = true;
    loadingText = "Поиск семейного круга по коду...";
    errorMessage = "";

    try {
      const [profile] = await Promise.all([
        joinFamily({
          invite_code: codeInputRaw,
        }),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      successData = profile;
      isSuccess = true;
    } catch {
      errorMessage = "Семейный круг с таким кодом не найден.";
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="family-screen">
  <!-- SUCCESS -->
  {#if isSuccess && successData}
    <div class="success-container" in:scale={{ duration: 500, start: 0.9 }}>
      <div class="success-card">
        <div class="sparkles-container">
          <span class="sparkle s1">✨</span>
          <span class="sparkle s2">⭐</span>
          <span class="sparkle s3">✨</span>
          <span class="sparkle s4">🎉</span>
          <span class="sparkle s5">💫</span>
          <span class="sparkle s6">🌟</span>
          <span class="sparkle s7">🎈</span>
          <span class="sparkle s8">🥳</span>
        </div>

        <div
          class="success-avatar-badge"
          style="background: {successData.icon_bg}"
        >
          <Icon
            icon={successData.icon}
            width="64"
            height="64"
            color={successData.icon_color}
          />

          <div class="badge-check">✓</div>
        </div>

        <h1 class="success-title">Пространство создано!</h1>

        <p class="success-subtitle">
          Добро пожаловать в семейный круг
          <br />

          <strong class="highlight-family-name">
            «{successData.name}»
          </strong>
        </p>

        <ButtonPrimaryGlow
          label="Войти в семейный круг →"
          on:click={handleProceedToApp}
        />
      </div>
    </div>

    <!-- LOADER -->
  {:else if isLoading}
    <div class="loader-container" in:fade={{ duration: 250 }}>
      <div class="loader-card">
        <div class="spinner-wrapper">
          <div class="radar-ping"></div>
          <div class="radar-ping-outer"></div>
          <div class="loader-spinner"></div>
          <span class="loader-center-icon">🏠</span>
        </div>
        <p class="loader-text">{loadingText}</p>
        <div class="loader-progress-bar">
          <div class="loader-progress-fill"></div>
        </div>
      </div>
    </div>

    <!-- ОСНОВНОЙ КОНТЕНТ -->
  {:else}
    <div class="wizard-carousel">
      <div
        class="wizard-panes"
        style="transform: translateX(-{slideIndex * 25}%)"
      >
        <!-- 0: WELCOME -->
        <div class="wizard-pane">
          <Welcome on:continue={() => goTo(SLIDES.choose)} />
        </div>

        <!-- 1: CHOOSE -->
        <div class="wizard-pane">
          <ChooseFamilyEntry
            on:choose={({ detail }) => handleChoose(detail.type)}
          />
        </div>

        <!-- 2: CREATE (шаг 1) или JOIN -->
        <div class="wizard-pane">
          {#if createOrJoin === "create"}
            <CreateFamily
              {errorMessage}
              familyName={familyForm.name}
              on:nameChange={(e) => (familyForm.name = e.detail)}
              on:next={handleNextStep}
              on:back={() => goTo(SLIDES.choose)}
            />
          {:else}
            <JoinFamily
              code={codeInputRaw}
              {errorMessage}
              on:codeChange={(e) => (codeInputRaw = e.detail)}
              on:submit={handleJoinByCode}
              on:back={() => goTo(SLIDES.choose)}
            />
          {/if}
        </div>

        <!-- 3: CREATE шаг 2 (аватар) -->
        <div class="wizard-pane">
          <div class="form-card">
            <div class="form-section">
              <h3>Установите семейный аватар</h3>
              <div class="edit-avatar-wrap">
                <AvatarConstructor
                  initialIcon={familyForm.icon}
                  initialIconColor={familyForm.icon_color}
                  initialBg={familyForm.icon_bg}
                  on:change={(e) => {
                    const { icon, icon_color, icon_bg } = e.detail;

                    familyForm = { ...familyForm, icon, icon_color, icon_bg };
                  }}
                />
              </div>

              <div class="wizard-actions-row">
                <BackButton on:click={() => goTo(SLIDES.createOrJoin)} />
                <ButtonPrimaryGlow
                  label="Создать семью ✨"
                  on:click={handleFinishCreate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .edit-avatar-wrap {
    display: flex;
    flex: 1;
    width: 100%;
  }
  /* ── БАЗОВАЯ СТРУКТУРА ── */
  .family-screen {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    /* min-height: 100dvh; */
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 16px;
    padding-top: 30%;
    background: var(--bg);
    color: var(--text-primary);
    overflow-x: hidden;
    justify-content: center;
  }

  /* ── ОСНОВНАЯ КАРТОЧКА ФОРМЫ ── */
  .form-card {
    width: 100%;
    flex: 1;
    padding: 24px;
    position: relative;
  }

  /* ── WIZARD СЛАЙДЕР С ПЕРЕЛИСТЫВАНИЕМ ── */
  .wizard-carousel {
    width: 100%;
    overflow: hidden;
  }

  .wizard-panes {
    display: flex;
    width: 400%;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .wizard-pane {
    width: 25%;
    box-sizing: border-box;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    display: flex;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .wizard-actions-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 10px;
  }

  /* ── ЛОАДЕР (ЗАГРУЗКА) ── */
  .loader-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }

  .loader-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 300px;
  }

  .spinner-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader-spinner {
    width: 100%;
    height: 100%;
    border: 4px solid var(--surface-alt);
    border-top: 4px solid var(--accent);
    border-radius: 50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    position: absolute;
  }

  .loader-center-icon {
    font-size: 28px;
    z-index: 5;
    animation: heartbeat 1.5s infinite ease-in-out;
  }

  .radar-ping {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--accent);
    opacity: 0.15;
    animation: ping 2s infinite ease-out;
  }

  .radar-ping-outer {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--accent);
    opacity: 0.1;
    animation: ping 2s infinite ease-out 0.6s;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes ping {
    0% {
      transform: scale(1);
      opacity: 0.2;
    }
    80%,
    100% {
      transform: scale(2.2);
      opacity: 0;
    }
  }

  @keyframes heartbeat {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .loader-text {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .loader-progress-bar {
    width: 120px;
    height: 4px;
    background: var(--surface-alt);
    border-radius: 2px;
    overflow: hidden;
  }

  .loader-progress-fill {
    width: 100%;
    height: 100%;
    background: var(--accent);
    animation: loadFill 2s infinite ease-in-out;
    transform-origin: left;
  }

  @keyframes loadFill {
    0% {
      transform: scaleX(0);
    }
    50% {
      transform: scaleX(0.7);
    }
    100% {
      transform: scaleX(1);
    }
  }

  @keyframes laserScan {
    0% {
      top: 8%;
      opacity: 0.4;
    }
    50% {
      top: 92%;
      opacity: 1;
    }
    100% {
      top: 8%;
      opacity: 0.4;
    }
  }

  @keyframes flash {
    0% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes radialGlowPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(213, 138, 114, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(213, 138, 114, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(213, 138, 114, 0);
    }
  }

  /* ── УСПЕХ (SUCCESS) СТИЛИ ── */
  .success-container {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
  }

  .success-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 32px;
    padding: 32px 24px;
    text-align: center;
    box-shadow: var(--shadow);
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .sparkles-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .sparkle {
    position: absolute;
    font-size: 20px;
    user-select: none;
    animation: floatSparkle 4s infinite ease-in-out;
  }

  .sparkle.s1 {
    top: 12%;
    left: 15%;
    animation-delay: 0s;
  }

  .sparkle.s2 {
    top: 8%;
    right: 18%;
    animation-delay: 1s;
  }

  .sparkle.s3 {
    bottom: 25%;
    left: 10%;
    animation-delay: 2s;
  }

  .sparkle.s4 {
    bottom: 20%;
    right: 12%;
    animation-delay: 0.5s;
  }

  .sparkle.s5 {
    top: 35%;
    left: 5%;
    animation-delay: 1.5s;
  }

  .sparkle.s6 {
    top: 25%;
    right: 5%;
    animation-delay: 2.5s;
  }

  .sparkle.s7 {
    bottom: 10%;
    left: 25%;
    animation-delay: 3s;
  }

  .sparkle.s8 {
    bottom: 35%;
    right: 30%;
    animation-delay: 1.2s;
  }

  @keyframes floatSparkle {
    0%,
    100% {
      transform: translateY(0) scale(1) rotate(0deg);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-10px) scale(1.2) rotate(15deg);
      opacity: 0.9;
    }
  }

  .success-avatar-badge {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow);
    position: relative;
    border: 3.5px solid var(--surface);
    animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes popIn {
    0% {
      transform: scale(0.4);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .badge-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .badge-emoji {
    font-size: 40px;
  }

  .badge-check {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--success);
    color: var(--bg);
    font-size: 16px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid var(--surface);
    box-shadow: var(--shadow);
    animation: checkScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.5) 0.5s both;
  }

  @keyframes checkScale {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }

  .success-title {
    font-size: 22px;
    font-weight: 850;
    margin: 0 0 10px 0;
    color: var(--text-primary);
  }

  .success-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0 0 24px 0;
  }

  .highlight-family-name {
    font-size: 17px;
    color: var(--accent);
    font-weight: 800;
    display: inline-block;
    margin-top: 4px;
  }
</style>
