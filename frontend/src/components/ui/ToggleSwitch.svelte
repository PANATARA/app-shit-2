<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let checked: boolean = false;
  export let disabled: boolean = false;

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
    flex-shrink: 0;
  }

  .tog.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tog-track {
    width: 42px;
    height: 24px;
    background: var(--accent-container);
    border-radius: 12px;
    position: relative;
    transition: background 0.22s;
    display: block;
  }

  .tog-on .tog-track {
    background: var(--accent);
  }

  .tog-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tog-on .tog-thumb {
    transform: translateX(18px);
  }
</style>
