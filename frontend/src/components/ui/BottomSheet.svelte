<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly, fade } from "svelte/transition";

  export let title = "";
  export let flyY = 300;
  export let flyDuration = 280;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }

  // ─── Drag to dismiss ─────────────────────────────────────────────────────

  let sheetEl;
  let dragY = 0;
  let isDragging = false;
  let startY = 0;
  let startTime = 0;

  const DISMISS_THRESHOLD = 120; // px — потянул дальше — закрываем
  const VELOCITY_THRESHOLD = 0.5; // px/ms — быстрый свайп закрывает даже на малом расстоянии

  function handleStart(clientY) {
    isDragging = true;
    startY = clientY;
    startTime = Date.now();
  }

  function handleMove(clientY) {
    if (!isDragging) return;
    const delta = clientY - startY;
    dragY = Math.max(0, delta);
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;

    const elapsed = Date.now() - startTime;
    const velocity = dragY / elapsed;

    if (dragY > DISMISS_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      close();
    } else {
      dragY = 0;
    }
  }

  // Touch events (Android/iOS WebView)
  function handleTouchStart(e) {
    handleStart(e.touches[0].clientY);
  }
  function handleTouchMove(e) {
    handleMove(e.touches[0].clientY);
  }
  function handleTouchEnd() {
    handleEnd();
  }

  // Pointer events (десктоп/современные браузеры)
  function handlePointerDown(e) {
    if (e.pointerType === "touch") return; // избегаем двойной обработки
    handleStart(e.clientY);
  }
  function handlePointerMove(e) {
    if (e.pointerType === "touch") return;
    handleMove(e.clientY);
  }
  function handlePointerUp(e) {
    if (e.pointerType === "touch") return;
    handleEnd();
  }
</script>

<div
  class="backdrop"
  role="button"
  tabindex="0"
  on:click={close}
  on:keydown={(e) => e.key === "Escape" && close()}
  transition:fade={{ duration: 250 }}
></div>

<div
  bind:this={sheetEl}
  class="sheet"
  class:dragging={isDragging}
  style="transform: translateY({dragY}px)"
  transition:fly={{ y: flyY, duration: flyDuration, opacity: 1 }}
>
  <div
    class="sheet-handle-area"
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
    on:pointerdown={handlePointerDown}
    on:pointermove={handlePointerMove}
    on:pointerup={handlePointerUp}
  >
    <div class="sheet-handle"></div>
  </div>

  <div class="sheet-title">
    {title}
  </div>
  <div class="sheet-content">
    <slot />
  </div>
  <!-- <button class="sheet-cancel" on:click={close}> Отмена </button> -->
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  .sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 101;
    background: var(--bg);
    border-radius: 20px 20px 0 0;
    padding: 0 0 max(24px, env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    transition: none;
    touch-action: none;
  }

  .sheet.dragging {
    transition: none;
  }

  .sheet-handle-area {
    padding: 12px 0 8px;
    display: flex;
    justify-content: center;
    cursor: grab;
    touch-action: none;
    flex-shrink: 0;
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .sheet-handle-area:active {
    cursor: grabbing;
  }

  .sheet-handle {
    width: 36px;
    height: 4px;
    background: var(--text-muted);
    border-radius: 2px;
  }

  .sheet-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    text-align: center;
    padding: 0 16px 8px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    flex-shrink: 0;
  }

  .sheet-content {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .sheet-cancel {
    margin: 12px 16px 0;
    padding: 16px;
    background: var(--bg-card);
    border: none;
    border-radius: 14px;
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.1s;
    flex-shrink: 0;
  }

  .sheet-cancel:active {
    background: var(--bg-card-deep);
  }
</style>
