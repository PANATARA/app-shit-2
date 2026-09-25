import { writable } from "svelte/store";

// Сохранить настройку
const saveSetting = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage unavailable:", e);
  }
};

// Получить настройку
const getSetting = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.warn("localStorage unavailable:", e);
    return defaultValue;
  }
};

// Инициализируем из localStorage, подписываемся на изменения
function createSettingsStore(key, defaultValue) {
  const initialValue = getSetting(key, defaultValue);
  const { subscribe, set, update } = writable(initialValue);

  return {
    subscribe,
    set: (value) => {
      saveSetting(key, value);
      set(value);
    },
    toggle: () =>
      update((value) => {
        const newValue = !value;
        saveSetting(key, newValue);
        return newValue;
      }),
    update: (fn) => {
      update((current) => {
        const newValue = fn(current);
        saveSetting(key, newValue);
        return newValue;
      });
    },
  };
}

// Exports
export const showDays = createSettingsStore("showDays", false);
export const theme = createSettingsStore("theme", "warm");
export const language = createSettingsStore("lang", "ru");

export const profileModal = writable(null);

export function openProfile(userId) {
  profileModal.set(userId);
}

export function closeProfile() {
  profileModal.set(null);
}

// theme
if (typeof document !== "undefined") {
  theme.subscribe((value) => {
    const active = (value === "sunset" ? "warm" : value === "rose" ? "soft" : value) || "warm";
    const allThemes = ["warm", "soft", "night", "royal", "sunset", "rose", "sage", "midnight", "amber"];
    document.body.classList.remove(...allThemes);
    document.body.classList.add(active);
    document.documentElement.setAttribute("data-theme", active);
    document.body.setAttribute("data-theme", active);
  });
}

if (typeof document !== "undefined") {
  language.subscribe((value) => {
    document.documentElement.setAttribute("lang", value);
    document.documentElement.setAttribute("data-lang", value);
  });
}
