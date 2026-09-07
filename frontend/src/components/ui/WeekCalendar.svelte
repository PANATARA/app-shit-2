<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher<{ change: Date }>();

    export let selectedDate: Date = new Date();

    const today = normalize(new Date());

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

    import { language } from "$lib/settings";

    function getDayName(date: Date, currentLang: string) {
        return date.toLocaleDateString(currentLang === "en" ? "en-US" : "ru-RU", { weekday: "short" });
    }

    function isToday(date: Date) {
        return isSameDay(date, today);
    }

    function isSelected(date: Date) {
        return isSameDay(date, selectedDate);
    }

    // ─── Недели: прошлая, текущая, следующая ─────────────────────────────────

    const MIN_OFFSET = -1;
    const MAX_OFFSET = 1;

    function getWeekDays(offset: number): Date[] {
        const base = getStartOfWeek(new Date());
        base.setDate(base.getDate() + offset * 7);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            return d;
        });
    }

    const weeks = [getWeekDays(-1), getWeekDays(0), getWeekDays(1)];

    // ─── Скролл ───────────────────────────────────────────────────────────────

    let container: HTMLElement;
    let currentWeek = 1; // начинаем с текущей недели

    onMount(() => {
        // скроллим к текущей неделе без анимации
        const w = container.offsetWidth;
        container.scrollLeft = w * currentWeek;
    });

    function onScroll() {
        const w = container.offsetWidth;
        const index = Math.round(container.scrollLeft / w);
        currentWeek = Math.max(0, Math.min(2, index));
    }

    function select(day: Date) {
        selectedDate = day;
        dispatch("change", day);
    }
</script>

<div class="calendar">
    <div class="scroll-wrapper">
        <div
            class="scroll-container"
            bind:this={container}
            on:scroll={onScroll}
        >
            {#each weeks as week}
                <div class="week">
                    {#each week as day}
                        <button
                            class="day"
                            class:selected={isSelected(day)}
                            class:today={isToday(day)}
                            on:click={() => select(day)}
                        >
                            <div class="weekday">{getDayName(day, $language)}</div>
                            <div class="date">{day.getDate()}</div>
                        </button>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
    <div class="header">
        <div class="dots">
            {#each weeks as _, i}
                <div class="dot" class:active={i === currentWeek}></div>
            {/each}
        </div>
    </div>
</div>

<style>
    .header {
        display: flex;
        align-items: center;
        padding: 0 2px;
        /*background-color: coral;*/
        justify-content: center;
    }

    .dots {
        display: flex;
        gap: 5px;
        align-items: center;
    }

    .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--border);
        transition: all 0.2s ease;
    }

    .dot.active {
        background: var(--accent);
        width: 18px;
        border-radius: 3px;
    }

    .scroll-wrapper {
        position: relative;
    }

    .calendar {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    /* ── Скролл-контейнер ───────────────────────── */
    .scroll-container {
        display: flex;
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        gap: 0;
    }

    .scroll-container::-webkit-scrollbar {
        display: none;
    }

    /* ── Неделя ───────────────────────── */
    .week {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        min-width: 100%;
        scroll-snap-align: start;
        margin-bottom: 3px;
        padding: 0 1px;
        box-sizing: border-box;
    }

    /* ── Дни ───────────────────────── */
    .day {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 18px 6px;
        border-radius: 25px;
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
