<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";

  const dispatch = createEventDispatcher();

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

  // Defensive reactive block to handle string/partial values seamlessly
  $: {
    if (typeof value === "string") {
      value = {
        frequency_type: value as FrequencyType,
        interval: 1,
        days_of_week: [],
        day_of_month: null,
        starts_at: getTodayIso(),
        ends_at: null,
      };
    } else if (!value || !value.frequency_type) {
      value = {
        frequency_type: "none",
        interval: 1,
        days_of_week: [],
        day_of_month: null,
        starts_at: getTodayIso(),
        ends_at: null,
      };
    }
    // Safeguard arrays and other nested properties
    if (value.frequency_type === "weekly" && !value.days_of_week) {
      value.days_of_week = [new Date().getDay()];
    }
    if (value.frequency_type === "monthly" && value.day_of_month === null) {
      value.day_of_month = new Date().getDate();
    }
  }

  const repeatOptions: { value: FrequencyType; label: string; icon: string }[] =
    [
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

  function getTomorrowIso(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }

  function getNextMondayIso(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = (8 - day) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  }

  function getDateMonthsFromNowIso(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0];
  }

  function update(partial: Partial<RepeatConfig>) {
    let nextValue = { ...value, ...partial };

    // Set smart defaults on frequency changes
    if (partial.frequency_type) {
      if (
        partial.frequency_type === "weekly" &&
        (!nextValue.days_of_week || nextValue.days_of_week.length === 0)
      ) {
        nextValue.days_of_week = [new Date().getDay()];
      }
      if (partial.frequency_type === "monthly" && !nextValue.day_of_month) {
        nextValue.day_of_month = new Date().getDate();
      }
    }

    value = nextValue;
    dispatch("change", value);
  }

  // Russian pluralization helper for dynamic intervals
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

    if (type === "daily") {
      return `Каждые ${interval} ${getPlural(interval, "день", "дня", "дней")}`;
    }
    if (type === "weekly") {
      return `Каждые ${interval} ${getPlural(interval, "неделю", "недели", "недель")}`;
    }
    if (type === "monthly") {
      return `Каждые ${interval} ${getPlural(interval, "месяц", "месяца", "месяцев")}`;
    }
    return `Интервал: ${interval}`;
  }

  function formatHumanDate(dateStr: string | null): string {
    if (!dateStr) return "Не установлено";
    try {
      const parts = dateStr.split("-");
      if (parts.length !== 3) return dateStr;
      const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      return d
        .toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        .replace(" г.", "");
    } catch {
      return dateStr;
    }
  }
</script>

<div class="repeat-selector-container">
  <!-- FREQUENCY TYPE GRID -->
  <div class="field">
    <label class="field-label">Повторяемость задачи</label>
    <div class="repeat-selector-grid">
      {#each repeatOptions as opt}
        <button
          type="button"
          class="repeat-option-card"
          class:active={value && value.frequency_type === opt.value}
          on:click={() => update({ frequency_type: opt.value })}
        >
          <span class="option-icon">
            <Icon icon={opt.icon} width="22" height="22" />
          </span>
          <span class="option-label">{opt.label}</span>
        </button>
      {/each}
    </div>
  </div>

  {#if value && value.frequency_type !== "none"}
    <!-- SETTINGS PANEL -->
    <div class="settings-panel">
      <!-- INTERVAL STEPPER -->
      <div class="field">
        <label class="field-label">Частота повторения</label>
        <div class="stepper-container">
          <button
            type="button"
            class="stepper-btn"
            disabled={value.interval <= 1}
            on:click={() =>
              update({ interval: Math.max(1, value.interval - 1) })}
            aria-label="Уменьшить интервал"
          >
            <Icon
              icon="material-symbols:remove-rounded"
              width="20"
              height="20"
            />
          </button>
          <div class="stepper-value-container">
            <span class="stepper-text">
              {getIntervalText(value.interval, value.frequency_type)}
            </span>
          </div>
          <button
            type="button"
            class="stepper-btn"
            disabled={value.interval >= 99}
            on:click={() =>
              update({ interval: Math.min(99, value.interval + 1) })}
            aria-label="Увеличить интервал"
          >
            <Icon icon="material-symbols:add-rounded" width="20" height="20" />
          </button>
        </div>
      </div>

      <!-- WEEKLY DAYS -->
      {#if value.frequency_type === "weekly"}
        <div class="field">
          <label class="field-label">Дни недели</label>
          <div class="weekly-container">
            <div class="days-row">
              {#each weekDays as d}
                <button
                  type="button"
                  class="day-circle"
                  class:active={value.days_of_week &&
                    value.days_of_week.includes(d.id)}
                  on:click={() => {
                    const days = value.days_of_week || [];
                    const exists = days.includes(d.id);
                    update({
                      days_of_week: exists
                        ? days.filter((x) => x !== d.id)
                        : [...days, d.id],
                    });
                  }}
                >
                  {d.label}
                </button>
              {/each}
            </div>

            <!-- Quick selections -->
            <div class="shortcuts-row">
              <button
                type="button"
                class="shortcut-link-btn"
                on:click={() => update({ days_of_week: [1, 2, 3, 4, 5] })}
              >
                Будни
              </button>
              <span class="shortcut-divider">•</span>
              <button
                type="button"
                class="shortcut-link-btn"
                on:click={() => update({ days_of_week: [6, 0] })}
              >
                Выходные
              </button>
              <span class="shortcut-divider">•</span>
              <button
                type="button"
                class="shortcut-link-btn"
                on:click={() => update({ days_of_week: [1, 2, 3, 4, 5, 6, 0] })}
              >
                Все дни
              </button>
              <span class="shortcut-divider">•</span>
              <button
                type="button"
                class="shortcut-link-btn text-danger"
                on:click={() => update({ days_of_week: [] })}
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
          <label class="field-label">Какого числа повторять</label>
          <div class="monthly-container">
            <div class="stepper-container">
              <button
                type="button"
                class="stepper-btn"
                disabled={(value.day_of_month || 1) <= 1}
                on:click={() =>
                  update({
                    day_of_month: Math.max(1, (value.day_of_month || 1) - 1),
                  })}
                aria-label="Уменьшить день"
              >
                <Icon
                  icon="material-symbols:remove-rounded"
                  width="20"
                  height="20"
                />
              </button>
              <div class="stepper-value-container">
                <span class="stepper-text">
                  {value.day_of_month || 1}-е число месяца
                </span>
              </div>
              <button
                type="button"
                class="stepper-btn"
                disabled={(value.day_of_month || 1) >= 31}
                on:click={() =>
                  update({
                    day_of_month: Math.min(31, (value.day_of_month || 1) + 1),
                  })}
                aria-label="Увеличить день"
              >
                <Icon
                  icon="material-symbols:add-rounded"
                  width="20"
                  height="20"
                />
              </button>
            </div>

            <!-- Quick presets -->
            <div class="presets-row">
              <button
                type="button"
                class="preset-chip"
                class:active={value.day_of_month === 1}
                on:click={() => update({ day_of_month: 1 })}
              >
                1-е число
              </button>
              <button
                type="button"
                class="preset-chip"
                class:active={value.day_of_month === 15}
                on:click={() => update({ day_of_month: 15 })}
              >
                В середине (15-е)
              </button>
              <button
                type="button"
                class="preset-chip"
                class:active={value.day_of_month === 31}
                on:click={() => update({ day_of_month: 31 })}
              >
                Конец месяца
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- PERIOD OF ACTIVITY CARD -->
      <div class="period-card">
        <div class="period-header">
          <Icon
            icon="material-symbols:event-repeat-rounded"
            width="18"
            height="18"
            class="period-icon"
          />
          <span class="period-title">Временной диапазон</span>
        </div>

        <div class="period-content">
          <!-- STARTS AT -->
          <div class="date-group">
            <div class="date-input-wrapper">
              <span class="date-input-icon">
                <Icon
                  icon="material-symbols:play-circle-outline-rounded"
                  width="22"
                  height="22"
                />
              </span>
              <div class="date-input-text">
                <span class="date-input-label">Дата начала</span>
                <span class="date-input-value"
                  >{formatHumanDate(value.starts_at)}</span
                >
              </div>
              <input
                class="real-date-input"
                type="date"
                value={value.starts_at}
                on:change={(e) => update({ starts_at: e.currentTarget.value })}
              />
            </div>

            <!-- Starts presets -->
            <div class="presets-row compact">
              <button
                type="button"
                class="preset-chip small"
                class:active={value.starts_at === getTodayIso()}
                on:click={() => update({ starts_at: getTodayIso() })}
              >
                Сегодня
              </button>
              <button
                type="button"
                class="preset-chip small"
                class:active={value.starts_at === getTomorrowIso()}
                on:click={() => update({ starts_at: getTomorrowIso() })}
              >
                Завтра
              </button>
              <button
                type="button"
                class="preset-chip small"
                class:active={value.starts_at === getNextMondayIso()}
                on:click={() => update({ starts_at: getNextMondayIso() })}
              >
                След. Пн
              </button>
            </div>
          </div>

          <!-- ENDS AT SECTION -->
          <div class="date-group">
            <div class="end-type-selector">
              <button
                type="button"
                class="end-type-btn"
                class:active={value.ends_at === null}
                on:click={() => update({ ends_at: null })}
              >
                <Icon
                  icon="material-symbols:all-inclusive-rounded"
                  width="16"
                  height="16"
                />
                <span>Бессрочно</span>
              </button>
              <button
                type="button"
                class="end-type-btn"
                class:active={value.ends_at !== null}
                on:click={() => {
                  if (!value.ends_at) {
                    update({ ends_at: getDateMonthsFromNowIso(1) });
                  }
                }}
              >
                <Icon
                  icon="material-symbols:event-busy-rounded"
                  width="16"
                  height="16"
                />
                <span>До даты</span>
              </button>
            </div>

            {#if value.ends_at !== null}
              <div class="date-input-wrapper animated-fade-in">
                <span class="date-input-icon">
                  <Icon
                    icon="material-symbols:stop-circle-outline-rounded"
                    width="22"
                    height="22"
                  />
                </span>
                <div class="date-input-text">
                  <span class="date-input-label">Дата окончания</span>
                  <span class="date-input-value"
                    >{formatHumanDate(value.ends_at)}</span
                  >
                </div>
                <input
                  class="real-date-input"
                  type="date"
                  value={value.ends_at}
                  on:change={(e) =>
                    update({ ends_at: e.currentTarget.value || null })}
                />
              </div>

              <!-- Ends presets -->
              <div class="presets-row compact animated-fade-in">
                <button
                  type="button"
                  class="preset-chip small"
                  class:active={value.ends_at === getDateMonthsFromNowIso(1)}
                  on:click={() =>
                    update({ ends_at: getDateMonthsFromNowIso(1) })}
                >
                  +1 мес
                </button>
                <button
                  type="button"
                  class="preset-chip small"
                  class:active={value.ends_at === getDateMonthsFromNowIso(3)}
                  on:click={() =>
                    update({ ends_at: getDateMonthsFromNowIso(3) })}
                >
                  +3 мес
                </button>
                <button
                  type="button"
                  class="preset-chip small"
                  class:active={value.ends_at === getDateMonthsFromNowIso(12)}
                  on:click={() =>
                    update({ ends_at: getDateMonthsFromNowIso(12) })}
                >
                  +1 год
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
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

  .preset-chip.small {
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 8px;
  }

  /* PERIOD ACTIVITY CARD STYLE */
  .period-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 4px;
    box-sizing: border-box;
  }

  .period-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
  }

  .period-icon {
    color: var(--accent);
  }

  .period-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .period-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .date-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* DATE CARD PICKER WRAPPER */
  .date-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--surface-alt);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 11px 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    width: 100%;
  }
  .date-input-icon {
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .date-input-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .date-input-label {
    font-size: 10px;
    color: var(--text-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .date-input-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .real-date-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: none;
  }

  .presets-row.compact {
    justify-content: flex-start;
    gap: 6px;
  }

  /* ENDS AT TYPE TOGGLE */
  .end-type-selector {
    display: flex;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 3px;
    gap: 4px;
    box-sizing: border-box;
    width: 100%;
  }

  .end-type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 10px;
    background: transparent;
    border: none;
    border-radius: 9px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .end-type-btn.active {
    background: var(--surface);
    color: var(--accent);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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

  .animated-fade-in {
    animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
