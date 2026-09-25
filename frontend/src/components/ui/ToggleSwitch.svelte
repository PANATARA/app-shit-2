<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { language } from "$lib/settings.js";

  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let label: string = "";

  const dispatch = createEventDispatcher();

  let lastClick = 0;
  const DEBOUNCE_MS = 300;

  function onClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    const now = Date.now();
    if (now - lastClick < DEBOUNCE_MS) return;
    lastClick = now;

    checked = !checked;
    dispatch("change", checked);
  }
</script>

<button
  class="tog"
  class:tog-on={checked}
  class:disabled
  on:click={onClick}
  type="button"
  aria-label={label || ($language === "en" ? "Toggle" : "Переключатель")}
  aria-pressed={checked}
>
  <span class="tog-track">
    <span class="tog-thumb"></span>
  </span>
</button>

<style>
  .tog {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.14s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .tog:active:not(.disabled) {
    transform: scale(0.96) translateZ(0);
  }

  .tog.disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .tog-track {
    width: 46px;
    height: 28px;
    background: color-mix(in srgb, var(--border) 80%, var(--surface-alt));
    border-radius: 999px;
    position: relative;
    transition: background 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    display: block;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .tog-on .tog-track {
    background: var(--accent);
  }

  .tog-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.08);
    transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .tog-on .tog-thumb {
    transform: translateX(18px) translateZ(0);
  }
</style>
