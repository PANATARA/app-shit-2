<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ change: Date }>();

  export let selectedDate: Date = new Date();

  const today = normalize(new Date());

  function normalize(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function isSameDay(a: Date, b: Date) {
    return a.toDateString() === b.toDateString();
  }

  // 🧠 get Monday as start of week
  function getStartOfWeek(date: Date) {
    const d = normalize(date);
    const day = d.getDay(); // 0 = Sun, 1 = Mon

    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);

    return d;
  }

  const startOfWeek = getStartOfWeek(new Date());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  function select(day: Date) {
    selectedDate = day;
    dispatch("change", day);
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
</script>

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

<style>
  .week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    margin-bottom: 5px;
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

  .day:hover {
    background: var(--surface-alt);
  }

  /* weekday */
  .weekday {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* date */
  .date {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  /* selected */
  .day.selected {
    background: var(--accent-soft);
    border-color: var(--accent);
  }

  .day.selected .date {
    color: var(--accent);
  }

  /* today */
  .day.today:not(.selected) {
    border-color: var(--success);
    box-shadow: 0 0 0 1px var(--success-soft);
  }

  .day.today:not(.selected) .date {
    color: var(--success);
  }
</style>
