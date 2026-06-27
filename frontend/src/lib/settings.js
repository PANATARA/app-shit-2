import { writable } from 'svelte/store';

// Сохранить настройку
const saveSetting = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('localStorage unavailable:', e);
    }
};

// Получить настройку
const getSetting = (key, defaultValue) => {
    try {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch (e) {
        console.warn('localStorage unavailable:', e);
        return defaultValue;
    }
};

// function applyTheme(theme) {
//   if (theme === 'light') {
//     document.body.classList.add('light');
//   } else {
//     document.body.classList.remove('light');
//   }
// }

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
    toggle: () => update(value => {
      const newValue = !value;
      saveSetting(key, newValue);
      return newValue;
    }),
    update: (fn) => {
      update(current => {
        const newValue = fn(current);
        saveSetting(key, newValue);
        return newValue;
    });
    }
  };
} 

// Exports
export const showDays = createSettingsStore('showDays', false);
export const theme = createSettingsStore('theme', 'dark');
export const language = createSettingsStore('lang', 'ru');
export const materialYou = createSettingsStore('materialYou', false);

// theme
if (typeof document !== 'undefined') {
    theme.subscribe(value => {
        if (value === 'light') {
            document.body.classList.add('light');
        } else {
            document.body.classList.remove('light');
        }
    });
}


if (typeof document !== 'undefined') {
    materialYou.subscribe(value => {
        if (value === true) {
            document.body.classList.add('material-you');
        } else {
            document.body.classList.remove('material-you');
        }
    });
}

if (typeof document !== 'undefined') {
  language.subscribe(value => {
    document.documentElement.setAttribute('lang', value);
    document.documentElement.setAttribute('data-lang', value);
  });
}