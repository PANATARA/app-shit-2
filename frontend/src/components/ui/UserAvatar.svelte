<script lang="ts">
  import  Icon  from "@iconify/svelte";
  import type { UserShort } from "$types/index";

  export let user: UserShort | null | undefined = undefined;
  export let size = 40;

  $: initials = user
    ? `${user.name?.[0] ?? ""}${user.surname?.[0] ?? ""}`.toUpperCase()
    : "";
</script>

{#if user}
  <div
    class="user-avatar"
    style={`
      width:${size}px;
      height:${size}px;
      background:${user.icon_bg};
      color:${user.icon_color};
    `}
  >
    {#if user.icon}
      <Icon icon={user.icon} width={size * 0.55} height={size * 0.55} />
    {:else}
      {initials}
    {/if}
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