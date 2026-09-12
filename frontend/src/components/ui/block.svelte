<script lang="ts">
  export let title = "";
  export let padding = 0;
  export let style = "";
</script>

<div class="block" style={`padding:${padding}px; ${style}`}>
  {#if title}
    <p class="title">{title}</p>
  {/if}
  <slot />
</div>

<style>
  .block {
    width: 100%;
    box-sizing: border-box;

    background: var(--surface);
    border-radius: var(--radius-card, 22px);
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }

  .title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin: 0 0 12px;
  }
</style>
