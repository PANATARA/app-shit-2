<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ change: Date }>();

  export let selectedDate: Date = new Date();

  const today = normalize(new Date());

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function normalize(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function isSameDay(a: Date, b: Date) {
    return a.toDateString() === b.toDateString();
  }

  function getStartOfWeek(date: Date) {
    const d = normalize(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  function getDayName(date: Date) {
    return date.toLocaleDateString("ru-RU", { weekday: "short" });
  }

  function isToday(date: Date) {
    return isSameDay(date, today);
  }

  function isSelected(date: Date) {
    return isSameDay(date, selectedDate);
  }

  // ─── Week offset (-1, 0, +1) ─────────────────────────────────────────────

  let weekOffset = 0;
  const MIN_OFFSET = -1;
  const MAX_OFFSET = 1;

  $: canGoPrev = weekOffset > MIN_OFFSET;
  $: canGoNext = weekOffset < MAX_OFFSET;

  function prevWeek() {
    if (canGoPrev) weekOffset -= 1;
  }

  function nextWeek() {
    if (canGoNext) weekOffset += 1;
  }

  // ─── Days ─────────────────────────────────────────────────────────────────

  $: days = (() => {
    const base = getStartOfWeek(new Date());
    base.setDate(base.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  })();

  // ─── Week label ───────────────────────────────────────────────────────────

  $: weekLabel = (() => {
    if (weekOffset === -1) return "Прошлая неделя";
    if (weekOffset === 0) return "Эта неделя";
    if (weekOffset === 1) return "Следующая неделя";
    return "";
  })();

  // ─── Select ───────────────────────────────────────────────────────────────

  function select(day: Date) {
    selectedDate = day;
    dispatch("change", day);
  }
</script>

<div class="calendar">
  <div class="nav">
    <button
      class="nav-btn"
      on:click={prevWeek}
      disabled={!canGoPrev}
      aria-label="Предыдущая неделя"
    >
      ‹
    </button>
    <span class="week-label">{weekLabel}</span>
    <button
      class="nav-btn"
      on:click={nextWeek}
      disabled={!canGoNext}
      aria-label="Следующая неделя"
    >
      ›
    </button>
  </div>

  <div class="week">
    {#each days as day}
      <button
        class="day"
        class:selected={isSelected(day)}
        class:today={isToday(day)}
        on:click={() => select(day)}
      >
        <div class="weekday">{getDayName(day)}</div>
        <div class="date">{day.getDate()}</div>
      </button>
    {/each}
  </div>
</div>

<style>
  .calendar {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── Nav ───────────────────────── */
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
  }

  .week-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s;
    padding: 0;
  }

  .nav-btn:disabled {
    opacity: 0.25;
    cursor: default;
  }

  .nav-btn:not(:disabled):active {
    opacity: 0.6;
  }

  /* ── Week ───────────────────────── */
  .week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 3px;
  }

  .day {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 6px;
    border-radius: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: 0.15s ease;
  }

  .weekday {
    font-size: 11px;
    color: var(--text-muted);
  }

  .date {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  .day.selected {
    background: var(--accent-soft);
    border-color: var(--accent);
  }

  .day.selected .date {
    color: var(--accent);
  }

  .day.today:not(.selected) {
    border-color: var(--success);
    box-shadow: 0 0 0 1px var(--success-soft);
  }

  .day.today:not(.selected) .date {
    color: var(--success);
  }
</style>
