<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { ChoreItem, DefaultChore } from "$types/index";

  export let chore: ChoreItem | DefaultChore | null | undefined = undefined;
  export let size = 40;
</script>

{#if chore}
  <div
    class="user-avatar"
    style={`
      width:${size}px;
      height:${size}px;
      background:${chore.icon_bg};
      color:${chore.icon_color};
    `}
  >
    <Icon icon={chore.icon} width={size * 0.55} height={size * 0.55} />
  </div>
{:else}
  <div
    class="user-avatar avatar-none"
    style={`
      width:${size}px;
      height:${size}px;
    `}
  >
    —
  </div>
{/if}

<style>
  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;
    flex-shrink: 0;
    overflow: hidden;

    font-weight: 600;
    user-select: none;
  }

  .avatar-none {
    background: #616162;
    color: #fff;
  }
</style>
