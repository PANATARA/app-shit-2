import { derived } from 'svelte/store';
import { language } from './settings.js';

export const translations = {
    ru: {
        homeScreen: {
            familyCard: {
                choresTotalСompleted: "Всего выполнено",
                choresWeekСompleted: "За неделю"
            },
            leadersCard:{
                title: "Лидеры недели"
            }

        },
        app: {
            habits: "Мои привычки",
            add: "Новая привычка",
            settings: "Настройки",

        },
        common: {
            weekdays: ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"],
            daysPrune: "дн."
        },
        settings: {
            title: "Настройки",

            sections: {
                general: "Основные",
                data: "Данные"
            },

            fields: {
                language: "Язык",
                appearance: "Оформление",
                colorScheme: "Цветовая схема",
                blur: "Блюр",
                notifications: "Уведомления",
                showWeekdays: "Дни недели на графике"
            },

            actions: {
                importExport: "Импорт/Экспорт данных",
                deleteAllData: "Удалить все данные"
            }
        },

        addHabit: {
            titlePlaceholder: "Название привычки",
            titleExample: "Например: Медитация",

            preview: {
                defaultTitle: "Название привычки",
                check: "✓ Чекбокс",
                counter: "# Счётчик",
                goal: "Цель",
            },

            fields: {
                title: "Название",
                trackingType: "Тип отслеживания",
                goal: "Цель (дней подряд)",
                dailyGoal: "Цель на день",
                color: "Цвет",
                icon: "Иконка"
            },

            tracking: {
                check: "Выполнено",
                counter: "Счётчик"
            },

            validation: {
                titleRequired: "Введите название привычки",
                goalInvalid: "Цель должна быть больше 0",
                dailyGoalInvalid: "Цель на день должна быть больше 0"
            },

            actions: {
                cancel: "Отмена",
                create: "Создать"
            },
        },
        habitDetail: {
            actions: {
                back: "Назад"
            },

            streak: {
                daysInRow: "дней подряд",
                record: "Рекорд",
                total: "Всего",
            },

            calendar: {
                prevMonth: "Предыдущий месяц",
                nextMonth: "Следующий месяц"
            },

            heatmap: {
                title: "Граф за последний год"
            }
        }
    },
    en: {
        app: {
            habits: "My Habits",
            add: "Add new habit",
            settings: "Settings",
        },
        common: {
            weekdays: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],
            daysPrune: "d"
        },

        settings: {
            title: "Settings",

            sections: {
                general: "General",
                data: "Data"
            },

            fields: {
                language: "Language",
                appearance: "Appearance",
                colorScheme: "Color scheme",
                blur: "Blur",
                notifications: "Notifications",
                showWeekdays: "Show weekdays on graph"
            },

            actions: {
                importExport: "Import / Export data",
                deleteAllData: "Delete all data"
            }
        },

        addHabit: {
            titlePlaceholder: "Habit name",
            titleExample: "For example: Meditation",

            preview: {
                defaultTitle: "Habit name",
                check: "✓ Checkbox",
                counter: "# Counter",
                goal: "Goal"
            },

            fields: {
                title: "Name",
                trackingType: "Tracking type",
                goal: "Goal (days in a row)",
                dailyGoal: "Daily goal",
                color: "Color",
                icon: "Icon"
            },

            tracking: {
                check: "Completed",
                counter: "Counter"
            },

            validation: {
                titleRequired: "Enter habit name",
                goalInvalid: "Goal must be greater than 0",
                dailyGoalInvalid: "Daily goal must be greater than 0"
            },

            actions: {
                cancel: "Cancel",
                create: "Create"
            }
        },

        habitDetail: {
            actions: {
                back: "Back"
            },

            streak: {
                daysInRow: "days in a row",
                record: "Record",
                total: "Total"
            },

            calendar: {
                prevMonth: "Previous month",
                nextMonth: "Next month"
            },

            heatmap: {
                title: "Yearly activity graph"
            }
        }
    }
};

export const t = derived(language, $lang => translations[$lang]);