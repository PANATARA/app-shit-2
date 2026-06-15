<script>
  import { showDays } from "./settings.js";

  let tooltipX = 0;
  let tooltipY = 0;

  function handlePointerDown(e, day) {
    activeDay = day;
    // Берем координаты самой ячейки относительно родителя
    const cell = e.currentTarget;
    tooltipX = cell.offsetLeft + cell.offsetWidth / 2;
    tooltipY = cell.offsetTop - 8; // 8px отступ сверху
  }

  export let data = [];
  export let dailyGoal = 0;
  export let theme = "#39d353";
  export let gap = 3;
  export let weeksCount = 14; //18
  export let cellSize = null; // px, null = авто (flex)

  export let fake = false;

  // const bg = "#151b23";
  const bg = "#202020";
  let activeDay = null;
  let fakeData = null; // null = показываем реальные

  function getLevel(count) {
    // consloe.log(count);
    if (count === 0) return 0;

    // Считаем долю выполнения от цели
    const ratio = count / dailyGoal;

    if (ratio >= 1) return 4; // 100%+ от цели — максимум
    if (ratio >= 0.75) return 3; // 75–99%
    if (ratio >= 0.4) return 2; // 40–74%
    return 1; // хоть что-то есть, но мало
  }

  function dateToString(date) {
    return date.toLocaleDateString("sv");
  }

  function startOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  function generateGrid(data) {
    const map = new Map(data.map((d) => [d.date, d.count]));
    const monday = startOfWeek(new Date());

    return Array.from({ length: weeksCount }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() - (weeksCount - 1 - w) * 7 + d);
        const count = map.get(dateToString(date)) ?? 0;
        return { date, count, level: getLevel(count) };
      }),
    );
  }

  function generateFake() {
    const today = new Date();
    fakeData = Array.from({ length: weeksCount * 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return { date: dateToString(date), count: Math.floor(Math.random() * 7) };
    });
  }

  $: colors = {
    0: bg,
    1: `color-mix(in srgb, ${theme} 25%, ${bg})`,
    2: `color-mix(in srgb, ${theme} 50%, ${bg})`,
    3: `color-mix(in srgb, ${theme} 75%, ${bg})`,
    4: theme,
  };

  $: grid = generateGrid(fakeData ?? data);
  $: if (fake) generateFake();
  $: if (!fake) fakeData = null
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
</script>

<div class="heatmap-wrapper" style="--gap:{gap}px;">
  <!-- Подписи дней -->
  {#if $showDays}
    <div class="days">
      {#each weekDays as day}
        <div class="day-label">{day}</div>
      {/each}
    </div>
  {/if}

  <!-- Основная сетка -->
  <div class="heatmap">
    {#each grid as week}
      <div class="week" style={cellSize ? `flex: 0 0 ${cellSize}px; width: ${cellSize}px;` : ""}>
        {#each week as day}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="cell"
            style="
              background: {colors[day.level]};
              transform: scale({activeDay === day ? 2 : 1});
              z-index: {activeDay === day ? 2 : 1};
              {cellSize ? `width:${cellSize}px; height:${cellSize}px;` : ''}
            "
            on:pointerdown={(e) => handlePointerDown(e, day)}
            on:pointerleave={() => (activeDay = null)}
          ></div>
        {/each}
      </div>
    {/each}
  </div>

  {#if activeDay}
    <div
      class="tooltip"
      style="left:{tooltipX-25}px; top:{tooltipY-50}px;"
    >
      <span class="tooltip-date">
        {activeDay.date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
      </span>
      <span class="tooltip-count">
        {#if activeDay.count === 0}
          —
        {:else}
          {activeDay.count} {"раз"}
        {/if}
      </span>
    </div>

  {/if}
</div>

<style>
  @keyframes tooltip-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .heatmap-wrapper {
    display: flex;
    gap: var(--gap);
    position: relative;
  }
  .days {
    display: flex;
    flex-direction: column;
  }
  .day-label {
    height: 100%;
    aspect-ratio: 1;
    font-size: 10px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 4px;
  }
  .heatmap {
    display: flex;
    gap: var(--gap);
    width: 100%;
  }
  .week {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }
  .cell {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 3px;
    /* position: relative; */
    transition:
      transform 0.15s ease,
      z-index 0.15s,
      background-color 0.2s ease;
  }
  .cell:hover {
    outline: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  /* Тултип */
  .tooltip {
    position: absolute;
    background: var(--bg-input);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 12px;
    pointer-events: none;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 2px;
    animation: tooltip-in 0.15s ease both;
    white-space: nowrap;

    transform: translate(-50%, -100%); 
    transition: left 0.1s ease, top 0.1s ease;
  }

  .tooltip-date {
    color: var(--text-muted);
    font-size: 11px;
  }

  .tooltip-count {
    color: var(--theme);
    font-weight: 600;
  }
  .tooltip::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background: var(--bg-input);
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
</style>