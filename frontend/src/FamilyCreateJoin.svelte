<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade, slide, scale } from "svelte/transition";
  import Block from "./components/block.svelte";
  import BackButton from "./components/backbtn.svelte";

  const dispatch = createEventDispatcher();

  // Экраны: 'welcome' → 'choose' → 'create' | 'join'
  type Screen = "welcome" | "choose" | "create" | "join";
  let screen: Screen = "welcome";

  let createStep: 1 | 2 = 1;
  let familyName = "";
  let avatarType: "preset" | "upload" = "preset";
  let selectedPresetIndex = 0;
  let customAvatarFile: File | null = null;
  let customAvatarUrl: string | null = null;

  let joinMethod: "code" | "qr" = "code";
  let codeInputRaw = "";
  let qrScanning = false;

  let isLoading = false;
  let loadingText = "";
  let isSuccess = false;
  let successData: {
    name: string;
    type: "created" | "joined";
    avatar?: string;
    avatarBg?: string;
  } | null = null;
  let errorMessage = "";

  const presets = [
    {
      bg: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      icon: "🏠",
      name: "Теплый дом",
    },
    {
      bg: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      icon: "🍀",
      name: "Зеленый луг",
    },
    {
      bg: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      icon: "🐬",
      name: "Тихий океан",
    },
    {
      bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "✨",
      name: "Волшебный круг",
    },
    {
      bg: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
      icon: "🌸",
      name: "Цветущая сакура",
    },
    {
      bg: "linear-gradient(135deg, #f68084 0%, #a14b5f 100%)",
      icon: "🍕",
      name: "Пицца-пати",
    },
  ];

  function goTo(s: Screen) {
    errorMessage = "";
    screen = s;
  }

  function handleNextStep() {
    if (!familyName.trim()) {
      errorMessage = "Пожалуйста, введите название вашей семьи";
      return;
    }
    errorMessage = "";
    createStep = 2;
  }

  function handlePrevStep() {
    errorMessage = "";
    createStep = 1;
  }

  let fileInputEl: HTMLInputElement;

  function triggerFileUpload() {
    fileInputEl.click();
  }

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      customAvatarFile = file;
      avatarType = "upload";
      const reader = new FileReader();
      reader.onload = (e) => {
        customAvatarUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleFinishCreate() {
    isLoading = true;
    loadingText = "Регистрация семейного пространства...";
    errorMessage = "";
    try {
      await new Promise((r) => setTimeout(r, 1800));
      const avatarValue =
        avatarType === "preset"
          ? presets[selectedPresetIndex].icon
          : customAvatarUrl || "🏠";
      const avatarBg =
        avatarType === "preset"
          ? presets[selectedPresetIndex].bg
          : "linear-gradient(135deg, #413a34 0%, #2b2622 100%)";
      successData = {
        name: familyName,
        type: "created",
        avatar: avatarValue,
        avatarBg,
      };
      isSuccess = true;
    } catch {
      errorMessage = "Не удалось создать семью. Попробуйте еще раз.";
    } finally {
      isLoading = false;
    }
  }

  function formatCodeInput(value: string) {
    let clean = value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);
    return clean.length > 3 ? clean.slice(0, 3) + "-" + clean.slice(3) : clean;
  }

  function handleCodeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    codeInputRaw = formatCodeInput(input.value);
    input.value = codeInputRaw;
    errorMessage = "";
  }

  async function handleJoinByCode() {
    if (codeInputRaw.replace("-", "").length < 6) {
      errorMessage = "Введите полный 6-значный код (например, ABC-123)";
      return;
    }
    isLoading = true;
    loadingText = "Поиск семейного круга по коду...";
    errorMessage = "";
    try {
      await new Promise((r) => setTimeout(r, 2000));
      successData = {
        name: "Семья Ивановых",
        type: "joined",
        avatar: "🏡",
        avatarBg: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      };
      isSuccess = true;
    } catch {
      errorMessage = "Семейный круг с таким кодом не найден.";
    } finally {
      isLoading = false;
    }
  }

  async function simulateQRScan() {
    isLoading = true;
    loadingText = "Считывание QR-кода...";
    await new Promise((r) => setTimeout(r, 1500));
    qrScanning = false;
    loadingText = "Подключение к найденной семье...";
    await new Promise((r) => setTimeout(r, 1500));
    successData = {
      name: "Лига Активных Ворчунов",
      type: "joined",
      avatar: "🦊",
      avatarBg: "linear-gradient(135deg, #f68084 0%, #a14b5f 100%)",
    };
    isSuccess = true;
    isLoading = false;
  }

  function handleProceedToApp() {
    dispatch("success", { family: successData });
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
        </div>
        <div
          class="success-avatar-badge"
          style="background: {successData.avatarBg}"
        >
          {#if successData.avatar?.startsWith("data:") || successData.avatar?.startsWith("blob:")}
            <img
              src={successData.avatar}
              alt="Family Avatar"
              class="badge-image"
            />
          {:else}
            <span class="badge-emoji">{successData.avatar}</span>
          {/if}
          <div class="badge-check">✓</div>
        </div>
        <h1 class="success-title">
          {successData.type === "created"
            ? "Пространство создано!"
            : "Успешное подключение!"}
        </h1>
        <p class="success-subtitle">
          Добро пожаловать в семейный круг<br />
          <strong class="highlight-family-name">«{successData.name}»</strong>
        </p>
        <button class="btn-action primary-glow" on:click={handleProceedToApp}>
          Войти в семейный круг →
        </button>
      </div>
    </div>

    <!-- QR SCANNER -->
  {:else if qrScanning}
    <div class="qr-scanner-overlay" in:fade={{ duration: 300 }}>
      <div class="qr-header">
        <h3>Сканирование QR</h3>
        <p>Наведите камеру на QR-код на экране устройства члена семьи</p>
      </div>
      <div class="viewfinder-container">
        <div class="viewfinder">
          <div class="scanner-laser"></div>
          <div class="corner-marker tl"></div>
          <div class="corner-marker tr"></div>
          <div class="corner-marker bl"></div>
          <div class="corner-marker br"></div>
        </div>
        <p class="scan-status">Поиск QR-кода...</p>
      </div>
      <div class="qr-footer-actions">
        <button class="btn-tab ghost" on:click={() => (qrScanning = false)}
          >Отмена</button
        >
        <button class="btn-action primary-glow" on:click={simulateQRScan}
          >✨ Имитировать скан</button
        >
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
    <div class="content-wrapper">
      <!-- ЭКРАН 1: WELCOME — только кнопка "Продолжить" -->
      {#if screen === "welcome"}
        <Block>
          <div class="first-info">
            <div class="icon-wrap">🏠</div>
            <h2 class="title">Семейный круг</h2>
            <p class="subtitle">
              Организуйте быт вместе — задания, привычки и награды для всей
              семьи
            </p>
            <div class="pills">
              <div class="pill"><span>👥</span> До 10 участников</div>
              <div class="pill"><span>🛡️</span> Только для своих</div>
              <div class="pill"><span>🔄</span> Синхронизация</div>
            </div>
            <button
              class="btn-action primary-glow"
              on:click={() => goTo("choose")}
            >
              Продолжить →
            </button>
          </div>
        </Block>

        <!-- ЭКРАН 2: CHOOSE — создать или присоединиться -->
      {:else if screen === "choose"}
        <Block>
          <div class="choose-options">
            <button class="choose-card" on:click={() => goTo("create")}>
              <span class="choose-icon">🆕</span>
              <strong>Создать семью</strong>
              <p>Я создаю новое семейное пространство и приглашу близких</p>
            </button>
            <button class="choose-card" on:click={() => goTo("join")}>
              <span class="choose-icon">🤝</span>
              <strong>Присоединиться</strong>
              <p>У меня есть код приглашения или QR-код от члена семьи</p>
            </button>
          </div>
        </Block>

        <!-- ЭКРАН 3A: CREATE -->
      {:else if screen === "create"}
        <div class="form-card" in:fade={{ duration: 200 }}>
          {#if errorMessage}
            <div class="error-toast" transition:slide={{ duration: 200 }}>
              <span>⚠️</span>
              {errorMessage}
            </div>
          {/if}

          <div class="wizard-carousel">
            <div class="wizard-panes" class:step-two-active={createStep === 2}>
              <!-- ШАГ 1 -->
              <div class="wizard-pane">
                <div class="form-section">
                  <h3>Как назовём вашу семью?</h3>
                  <p class="step-desc">
                    Это название будут видеть все участники круга.
                  </p>
                  <div class="input-container">
                    <span class="input-icon-left">🏡</span>
                    <input
                      type="text"
                      placeholder="Например: Супер Семейка"
                      bind:value={familyName}
                      class="custom-input"
                      maxlength="36"
                    />
                    {#if familyName}
                      <button
                        class="clear-btn"
                        on:click={() => (familyName = "")}>×</button
                      >
                    {/if}
                  </div>
                  <div class="form-tips">
                    <span class="tip-dot">•</span>
                    <p>Позже название можно изменить в настройках.</p>
                  </div>
                  <button
                    class="btn-action primary-glow"
                    on:click={handleNextStep}>Продолжить →</button
                  >
                  <BackButton on:click={() => goTo("choose")} />
                </div>
              </div>

              <!-- ШАГ 2 -->
              <div class="wizard-pane">
                <div class="form-section">
                  <h3>Установите семейный аватар</h3>
                  <div class="avatar-preview-area">
                    <div
                      class="avatar-circle-large"
                      style="background: {avatarType === 'preset'
                        ? presets[selectedPresetIndex].bg
                        : 'transparent'}"
                      class:custom-uploaded={avatarType === "upload"}
                    >
                      {#if avatarType === "upload" && customAvatarUrl}
                        <img
                          src={customAvatarUrl}
                          alt="Custom family avatar"
                          class="custom-avatar-img"
                          in:fade
                        />
                      {:else}
                        <span class="avatar-emoji-large">👥</span>
                      {/if}
                      <input
                        type="file"
                        accept="image/*"
                        bind:this={fileInputEl}
                        on:change={handleFileChange}
                        class="hidden-file-input"
                      />
                    </div>
                  </div>

                  <div class="uploaded-info" in:fade={{ duration: 200 }}>
                    {#if customAvatarFile}
                      <p class="file-name-label">
                        📁 {customAvatarFile.name}
                      </p>
                      <button
                        class="btn-text-danger"
                        on:click={() => {
                          customAvatarFile = null;
                          customAvatarUrl = null;
                          avatarType = "preset";
                        }}>Удалить фото</button
                      >
                    {:else}
                      <button
                        class="btn-upload-placeholder"
                        on:click={triggerFileUpload}
                      >
                        <span class="placeholder-plus">+</span> Выбрать изображение
                        с устройства
                      </button>
                    {/if}
                  </div>

                  <div class="wizard-actions-row">
                    <BackButton on:click={handlePrevStep} />
                    <button
                      class="btn-action primary-glow"
                      on:click={handleFinishCreate}>Создать семью ✨</button
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ЭКРАН 3B: JOIN -->
      {:else if screen === "join"}
        <div class="form-card" in:fade={{ duration: 200 }}>
          <div class="join-tabs">
            <button
              class="join-tab"
              class:active={joinMethod === "code"}
              on:click={() => (joinMethod = "code")}>🔢 Секретный код</button
            >
            <button
              class="join-tab"
              class:active={joinMethod === "qr"}
              on:click={() => (joinMethod = "qr")}>📷 QR-код</button
            >
          </div>

          {#if errorMessage}
            <div class="error-toast" transition:slide={{ duration: 200 }}>
              <span>⚠️</span>
              {errorMessage}
            </div>
          {/if}

          {#if joinMethod === "code"}
            <div class="join-form-pane" in:fade={{ duration: 200 }}>
              <p class="join-hint-text">
                Введите 6-значный пригласительный код вашей семьи.
              </p>
              <div class="code-entry-box">
                <label for="invite-code-input" class="code-input-label"
                  >Пригласительный код</label
                >
                <input
                  id="invite-code-input"
                  type="text"
                  placeholder="AAA-000"
                  value={codeInputRaw}
                  on:input={handleCodeInput}
                  class="monospaced-code-input"
                  autocomplete="off"
                  autocapitalize="characters"
                  spellcheck="false"
                />
                <span class="code-subtext"
                  >Формат: три символа, дефис, три символа</span
                >
              </div>
              <button
                class="btn-action primary-glow"
                on:click={handleJoinByCode}>Присоединиться →</button
              >
            </div>
          {:else}
            <div class="join-form-pane" in:fade={{ duration: 200 }}>
              <p class="join-hint-text">
                Попросите администратора семьи открыть экран «Пригласить
                участника» и отсканируйте QR-код.
              </p>
              <div class="qr-preview-box">
                <div class="dummy-qr-border">
                  <svg
                    viewBox="0 0 24 24"
                    width="80"
                    height="80"
                    fill="var(--text-secondary)"
                  >
                    <path
                      d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-2zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 3h2v2h-2v-2zm3 3h2v2h-2v-2zm-3-3h2v2h-2v-2zm3 3h2v2h-2v-2zm-3-6h2v2h-2V7zm3 3h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 3h2v2h-2v-2z"
                    />
                  </svg>
                </div>
              </div>
              <button
                class="btn-action primary-glow"
                on:click={() => (qrScanning = true)}
                >📷 Открыть сканер камеры</button
              >
            </div>
          {/if}

          <BackButton label="К выбору" on:click={() => goTo("choose")} />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .choose-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
    padding: 32px 24px 0;
  }

  .choose-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    background: var(--surface-secondary, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background 0.2s;
  }

  .choose-card:hover {
    border-color: var(--accent);
    background: var(--surface-hover, rgba(255, 255, 255, 0.08));
  }

  .choose-icon {
    font-size: 28px;
    margin-bottom: 4px;
  }

  .choose-card strong {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .choose-card p {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }
  .step-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 4px 0 16px;
  }
  /* ── БАЗОВАЯ СТРУКТУРА ── */
  .family-screen {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 16px;
    background: var(--bg);
    color: var(--text-primary);
    overflow-x: hidden;
    justify-content: center;
  }

  /* ── КРАСИВАЯ ШАПКА ── */

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

  /* ── ОСНОВНАЯ КАРТОЧКА ФОРМЫ ── */
  .form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 24px;
    box-shadow: var(--shadow);
    position: relative;
  }

  /* ── WIZARD СЛАЙДЕР С ПЕРЕЛИСТЫВАНИЕМ ── */
  .wizard-carousel {
    width: 100%;
    overflow: hidden;
  }

  .wizard-panes {
    display: flex;
    width: 200%;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .wizard-panes.step-two-active {
    transform: translateX(-50%);
  }

  .wizard-pane {
    width: 50%;
    box-sizing: border-box;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  /* ── КРАСИВЫЙ ИНПУТ С ИКОНКОЙ ── */
  .input-container {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .input-icon-left {
    position: absolute;
    left: 14px;
    font-size: 18px;
    pointer-events: none;
  }

  .custom-input {
    width: 100%;
    box-sizing: border-box;
    background: var(--surface-alt);
    border: 1.5px solid var(--border);
    padding: 14px 44px 14px 42px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    transition: all 0.2s ease;
  }

  .custom-input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: 0 0 0 3px var(--nav-active-bg);
  }

  .clear-btn {
    position: absolute;
    right: 14px;
    background: var(--border);
    border: none;
    color: var(--text-secondary);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s ease;
  }

  .clear-btn:hover {
    background: var(--text-muted);
    color: var(--surface);
  }
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0) rotate(0);
    }
    50% {
      transform: translateY(-3px) rotate(15deg);
    }
  }

  /* ── ИНТЕРАКТИВНЫЕ ПОДСКАЗКИ ── */
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

  /* ── КНОПКИ ДЕЙСТВИЯ ── */
  .btn-action {
    background: var(--accent);
    color: var(--bg);
    border: none;
    padding: 14px 20px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-action:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.95;
  }

  .btn-action:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .primary-glow {
    position: relative;
    overflow: hidden;
  }

  .primary-glow::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    transform: rotate(45deg);
    transition: left 0.7s ease;
  }

  .primary-glow:hover::after {
    left: 120%;
  }

  /* ── ШАГ 2: ИНТЕРАКТИВНЫЙ АВАТАР ── */
  .avatar-preview-area {
    display: flex;
    justify-content: center;
    margin: 10px 0;
  }

  .avatar-circle-large {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow);
    border: 3px solid var(--surface-alt);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
  }

  .avatar-circle-large.custom-uploaded {
    background: var(--surface-alt);
    border-color: var(--accent);
  }

  .avatar-emoji-large {
    font-size: 44px;
    display: block;
    user-select: none;
  }

  .custom-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hidden-file-input {
    display: none;
  }

  /* ЗАГРУЗКА */
  .uploaded-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px;
    background: var(--surface-alt);
    border-radius: 14px;
    border: 1.5px dashed var(--border);
  }

  .file-name-label {
    font-size: 13px;
    font-weight: 600;
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btn-text-danger {
    background: transparent;
    border: none;
    color: #f87171;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
  }

  .btn-upload-placeholder {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
  }

  .placeholder-plus {
    font-size: 24px;
    color: var(--accent);
  }

  .wizard-actions-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 10px;
  }

  .wizard-actions-row .btn-action {
    flex: 1.2;
  }

  .join-tabs {
    display: flex;
    border-bottom: 1.5px solid var(--divider);
    padding-bottom: 2px;
  }

  .join-tab {
    flex: 1;
    background: transparent;
    border: none;
    padding: 12px 6px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
  }

  .join-tab.active {
    color: var(--accent);
  }

  .join-tab.active::after {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 15%;
    width: 70%;
    height: 3px;
    background: var(--accent);
    border-radius: 4px;
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

  .qr-preview-box {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }

  .dummy-qr-border {
    position: relative;
    padding: 24px;
    background: var(--surface-alt);
    border: 2.5px dashed var(--border);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
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

  /* ── QR СКАНЕР Камера ── */
  .qr-scanner-overlay {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 16px 8px;
  }

  .qr-header {
    text-align: center;
  }

  .qr-header h3 {
    margin: 0 0 6px 0;
    font-size: 20px;
    font-weight: 800;
  }

  .qr-header p {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
    max-width: 320px;
  }

  .viewfinder-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin: auto 0;
  }

  .viewfinder {
    position: relative;
    width: 220px;
    height: 220px;
    border-radius: 24px;
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 0 100vw rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .scanner-laser {
    position: absolute;
    left: 4%;
    width: 92%;
    height: 3px;
    background: #4ade80;
    box-shadow:
      0 0 12px #4ade80,
      0 0 3px #4ade80;
    animation: laserScan 2.5s infinite ease-in-out;
    z-index: 15;
    border-radius: 2px;
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

  /* УГЛЫ ВИДОИСКАТЕЛЯ */
  .corner-marker {
    position: absolute;
    width: 24px;
    height: 24px;
    border: 3.5px solid #4ade80;
    pointer-events: none;
    z-index: 16;
  }

  .corner-marker.tl {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
    border-top-left-radius: 16px;
  }
  .corner-marker.tr {
    top: -2px;
    right: -2px;
    border-left: none;
    border-bottom: none;
    border-top-right-radius: 16px;
  }
  .corner-marker.bl {
    bottom: -2px;
    left: -2px;
    border-right: none;
    border-top: none;
    border-bottom-left-radius: 16px;
  }
  .corner-marker.br {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
    border-bottom-right-radius: 16px;
  }

  .scan-status {
    font-size: 13px;
    font-weight: 700;
    color: #4ade80;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
    animation: flash 1.5s infinite alternate;
  }

  @keyframes flash {
    0% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }

  .qr-footer-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 320px;
    z-index: 20;
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
  /* ── КНОПКИ ТАБОВ И ОБЩЕЕ ── */
  .btn-tab {
    background: transparent;
    border: 1.5px solid var(--border);
    color: var(--text-primary);
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .btn-tab:hover {
    background: var(--surface-alt);
  }

  .btn-tab.ghost {
    border-color: var(--border);
    color: var(--text-secondary);
  }

  .btn-tab.ghost:hover {
    background: var(--surface-alt);
    color: var(--text-primary);
  }
</style>
