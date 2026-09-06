<script lang="ts">
    import Icon from "@iconify/svelte";

    type FrequencyType = "none" | "daily" | "weekly" | "monthly";

    interface RepeatConfig {
        frequency_type: FrequencyType;
        interval: number;
        days_of_week: number[];
        day_of_month: number | null;
        starts_at: string;
        ends_at: string | null;
    }

    export let value: RepeatConfig;
    export let onChange: (v: RepeatConfig) => void = () => {};

    // Defensive init
    $: if (!value?.frequency_type) {
        value = {
            frequency_type: "none",
            interval: 1,
            days_of_week: [],
            day_of_month: null,
            starts_at: getTodayIso(),
            ends_at: null,
        };
    }

    const repeatOptions: {
        value: FrequencyType;
        label: string;
        icon: string;
    }[] = [
        {
            value: "none",
            label: "Не повторять",
            icon: "material-symbols:block-rounded",
        },
        {
            value: "daily",
            label: "Каждый день",
            icon: "material-symbols:today-rounded",
        },
        {
            value: "weekly",
            label: "Каждую неделю",
            icon: "material-symbols:view-week-rounded",
        },
        {
            value: "monthly",
            label: "Каждый месяц",
            icon: "material-symbols:calendar-month-rounded",
        },
    ];

    const weekDays = [
        { id: 1, label: "Пн" },
        { id: 2, label: "Вт" },
        { id: 3, label: "Ср" },
        { id: 4, label: "Чт" },
        { id: 5, label: "Пт" },
        { id: 6, label: "Сб" },
        { id: 0, label: "Вс" },
    ];

    function getTodayIso(): string {
        return new Date().toISOString().split("T")[0];
    }

    function update(partial: Partial<RepeatConfig>) {
        let next = { ...value, ...partial };

        if (partial.frequency_type === "weekly" && !next.days_of_week?.length) {
            next.days_of_week = [new Date().getDay()];
        }
        if (partial.frequency_type === "monthly" && !next.day_of_month) {
            next.day_of_month = new Date().getDate();
        }

        value = next;
        onChange(next);
    }

    function toggleDay(id: number) {
        const days = value.days_of_week ?? [];
        update({
            days_of_week: days.includes(id)
                ? days.filter((x) => x !== id)
                : [...days, id],
        });
    }

    function getPlural(
        n: number,
        one: string,
        two: string,
        five: string,
    ): string {
        const absN = Math.abs(n) % 100;
        const n1 = absN % 10;
        if (absN > 10 && absN < 20) return five;
        if (n1 > 1 && n1 < 5) return two;
        if (n1 === 1) return one;
        return five;
    }

    function getIntervalText(interval: number, type: FrequencyType): string {
        if (interval === 1) {
            if (type === "daily") return "Каждый день";
            if (type === "weekly") return "Каждую неделю";
            if (type === "monthly") return "Каждый месяц";
        }
        if (type === "daily")
            return `Каждые ${interval} ${getPlural(interval, "день", "дня", "дней")}`;
        if (type === "weekly")
            return `Каждые ${interval} ${getPlural(interval, "неделю", "недели", "недель")}`;
        if (type === "monthly")
            return `Каждые ${interval} ${getPlural(interval, "месяц", "месяца", "месяцев")}`;
        return `Интервал: ${interval}`;
    }
</script>

<div class="repeat-selector-container">
    <!-- FREQUENCY GRID -->
    <div class="field">
        <span class="field-label">Повторяемость задачи</span>
        <div class="repeat-selector-grid">
            {#each repeatOptions as opt}
                <button
                    type="button"
                    class="repeat-option-card"
                    class:active={value.frequency_type === opt.value}
                    onclick={() => update({ frequency_type: opt.value })}
                >
                    <span class="option-icon">
                        <Icon icon={opt.icon} width={22} height={22} />
                    </span>
                    <span class="option-label">{opt.label}</span>
                </button>
            {/each}
        </div>
    </div>

    {#if value.frequency_type !== "none"}
        <div class="settings-panel">
            <!-- INTERVAL -->
            <div class="field">
                <span class="field-label">Частота повторения</span>
                <div class="stepper-container">
                    <button
                        type="button"
                        class="stepper-btn"
                        disabled={value.interval <= 1}
                        onclick={() =>
                            update({
                                interval: Math.max(1, value.interval - 1),
                            })}
                        aria-label="Уменьшить интервал"
                    >
                        <Icon
                            icon="material-symbols:remove-rounded"
                            width={20}
                            height={20}
                        />
                    </button>
                    <div class="stepper-value-container">
                        <span class="stepper-text">
                            {getIntervalText(
                                value.interval,
                                value.frequency_type,
                            )}
                        </span>
                    </div>
                    <button
                        type="button"
                        class="stepper-btn"
                        disabled={value.interval >= 99}
                        onclick={() =>
                            update({
                                interval: Math.min(99, value.interval + 1),
                            })}
                        aria-label="Увеличить интервал"
                    >
                        <Icon
                            icon="material-symbols:add-rounded"
                            width={20}
                            height={20}
                        />
                    </button>
                </div>
            </div>

            <!-- WEEKLY DAYS -->
            {#if value.frequency_type === "weekly"}
                <div class="field">
                    <span class="field-label">Дни недели</span>
                    <div class="weekly-container">
                        <div class="days-row">
                            {#each weekDays as d}
                                <button
                                    type="button"
                                    class="day-circle"
                                    class:active={value.days_of_week?.includes(
                                        d.id,
                                    )}
                                    onclick={() => toggleDay(d.id)}
                                >
                                    {d.label}
                                </button>
                            {/each}
                        </div>
                        <div class="shortcuts-row">
                            <button
                                type="button"
                                class="shortcut-link-btn"
                                onclick={() =>
                                    update({ days_of_week: [1, 2, 3, 4, 5] })}
                            >
                                Будни
                            </button>
                            <span class="shortcut-divider">•</span>
                            <button
                                type="button"
                                class="shortcut-link-btn"
                                onclick={() => update({ days_of_week: [6, 0] })}
                            >
                                Выходные
                            </button>
                            <span class="shortcut-divider">•</span>
                            <button
                                type="button"
                                class="shortcut-link-btn"
                                onclick={() =>
                                    update({
                                        days_of_week: [1, 2, 3, 4, 5, 6, 0],
                                    })}
                            >
                                Все дни
                            </button>
                            <span class="shortcut-divider">•</span>
                            <button
                                type="button"
                                class="shortcut-link-btn text-danger"
                                onclick={() => update({ days_of_week: [] })}
                            >
                                Сбросить
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- MONTHLY DAY -->
            {#if value.frequency_type === "monthly"}
                <div class="field">
                    <span class="field-label">Какого числа повторять</span>
                    <div class="monthly-container">
                        <div class="stepper-container">
                            <button
                                type="button"
                                class="stepper-btn"
                                disabled={(value.day_of_month ?? 1) <= 1}
                                onclick={() =>
                                    update({
                                        day_of_month: Math.max(
                                            1,
                                            (value.day_of_month ?? 1) - 1,
                                        ),
                                    })}
                                aria-label="Уменьшить день"
                            >
                                <Icon
                                    icon="material-symbols:remove-rounded"
                                    width={20}
                                    height={20}
                                />
                            </button>
                            <div class="stepper-value-container">
                                <span class="stepper-text">
                                    {value.day_of_month ?? 1}-е число месяца
                                </span>
                            </div>
                            <button
                                type="button"
                                class="stepper-btn"
                                disabled={(value.day_of_month ?? 1) >= 31}
                                onclick={() =>
                                    update({
                                        day_of_month: Math.min(
                                            31,
                                            (value.day_of_month ?? 1) + 1,
                                        ),
                                    })}
                                aria-label="Увеличить день"
                            >
                                <Icon
                                    icon="material-symbols:add-rounded"
                                    width={20}
                                    height={20}
                                />
                            </button>
                        </div>
                        <div class="presets-row">
                            <button
                                type="button"
                                class="preset-chip"
                                class:active={value.day_of_month === 1}
                                onclick={() => update({ day_of_month: 1 })}
                            >
                                1-е число
                            </button>
                            <button
                                type="button"
                                class="preset-chip"
                                class:active={value.day_of_month === 15}
                                onclick={() => update({ day_of_month: 15 })}
                            >
                                В середине (15-е)
                            </button>
                            <button
                                type="button"
                                class="preset-chip"
                                class:active={value.day_of_month === 31}
                                onclick={() => update({ day_of_month: 31 })}
                            >
                                Конец месяца
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- PERIOD CARD -->
        </div>
    {/if}
</div>

<style>
    .repeat-selector-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        box-sizing: border-box;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }

    .field-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin-bottom: 2px;
    }

    /* FREQUENCY GRID STYLE */
    .repeat-selector-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        width: 100%;
    }

    .repeat-option-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 10px;
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: 16px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        box-sizing: border-box;
        outline: none;
    }

    .repeat-option-card.active {
        background: var(--accent-soft);
        border-color: var(--accent);
        color: var(--accent);
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .option-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
    }

    .repeat-option-card.active .option-icon {
        transform: scale(1.1);
    }

    .option-label {
        font-weight: 600;
    }

    /* SETTINGS PANEL WITH SOFT BACKGROUND */
    .settings-panel {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 4px 0;
        animation: slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* STEPPER COMPONENT */
    .stepper-container {
        display: flex;
        align-items: center;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 4px;
        width: 100%;
        box-sizing: border-box;
    }

    .stepper-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--surface-alt);
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.15s;
    }

    .stepper-btn:active:not(:disabled) {
        transform: scale(0.95);
    }

    .stepper-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        background: transparent;
    }

    .stepper-value-container {
        flex: 1;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 10px;
    }

    .stepper-text {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
    }

    /* WEEKLY DAYS CIRCLES */
    .weekly-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }

    .days-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 4px;
        width: 100%;
    }

    .day-circle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: inherit;
        padding: 0;
    }

    .day-circle.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #ffffff; /* White text for ultimate contrast in circles */
        transform: scale(1.08);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .shortcuts-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 2px;
    }

    .shortcut-link-btn {
        background: none;
        border: none;
        color: var(--accent);
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 6px;
        transition: background 0.15s;
        font-family: inherit;
    }

    .shortcut-link-btn.text-danger {
        color: var(--text-muted);
    }

    .shortcut-divider {
        font-size: 10px;
        color: var(--text-muted);
    }

    /* MONTHLY LAYOUT & PRESET CHIPS */
    .monthly-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }

    .presets-row {
        display: flex;
        gap: 8px;
        width: 100%;
        overflow-x: auto;
        padding-bottom: 2px;
        scrollbar-width: none;
    }

    .presets-row::-webkit-scrollbar {
        display: none;
    }

    .preset-chip {
        flex: 1;
        white-space: nowrap;
        text-align: center;
        padding: 8px 10px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
    }

    .preset-chip.active {
        background: var(--accent-soft);
        border-color: var(--accent);
        color: var(--accent);
    }

    /* ANIMATIONS */
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
