<script lang="ts">
  import { icons } from "./icons";

  export let name: string;
  export let size: number = 24;
  export let color: string = "currentColor";
  export let viewBox: string = "0 0 24 24";

  const getPath = (name: string) => icons[name] ?? "";
</script>

<svg
  width={size}
  height={size}
  {viewBox}
  fill={color}
  xmlns="http://www.w3.org/2000/svg"
  class="icon"
>
  {@html getPath(name)}
</svg>

<style>
  .icon {
    display: inline-flex;
    vertical-align: middle;
    flex-shrink: 0;
  }
</style>
