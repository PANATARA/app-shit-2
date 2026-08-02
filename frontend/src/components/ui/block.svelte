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
    /*border: 1px solid var(--border);*/

    /*box-shadow: var(--shadow);*/
    box-shadow:
        0 1px 0 rgba(0, 0, 0, 0.04),
        0 2px 4px rgba(0, 0, 0, 0.04),
        0 8px 16px rgba(0, 0, 0, 0.06);
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text);

    margin-bottom: 14px;
  }
</style>
