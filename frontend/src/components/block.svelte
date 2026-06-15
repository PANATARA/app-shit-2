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
    border-radius: 22px;
    border: 1px solid var(--border);

    box-shadow: var(--shadow);
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text);

    margin-bottom: 14px;
  }
</style>
