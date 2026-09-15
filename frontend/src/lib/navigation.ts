import type { ChoreItem, AnyPlannedChore, PlannedChore } from "$types/index";
import { writable } from "svelte/store";

export type Tab =
  | "statsScreen"
  | "boardScreen"
  | "settingsScreen"
  | "debugScreen"
  | "createPlannedChoreStepOne"
  | "createPlannedChoreStepTwo"
  | "DetailPlannedChore"
  | "choreListScreen"
  | "choreEditScreen"
  | "choreCreateScreen"
  | "choreTemplatesScreen"
  | "onboardingWelcome"
  | "onboardingChoose"
  | "onboardingCreateStep1"
  | "onboardingCreateStep2"
  | "onboardingJoin"
  | "eventsListScreen"
  | "eventCreate";

export const activeTab = writable<Tab>("statsScreen");

export const ROOT_TABS: Tab[] = [
  "statsScreen",
  "boardScreen",
  "debugScreen",
  "settingsScreen",
];

/**
 * Родительские экраны по умолчанию (fallback для каждого экрана).
 */
export const screenParents: Partial<Record<Tab, Tab>> = {
  createPlannedChoreStepTwo: "createPlannedChoreStepOne",
  createPlannedChoreStepOne: "boardScreen",
  DetailPlannedChore: "boardScreen",
  choreEditScreen: "choreListScreen",
  choreCreateScreen: "choreTemplatesScreen",
  choreTemplatesScreen: "choreListScreen",
  choreListScreen: "settingsScreen",
  eventsListScreen: "statsScreen",
  eventCreate: "statsScreen",
  onboardingCreateStep2: "onboardingCreateStep1",
  onboardingCreateStep1: "onboardingChoose",
  onboardingJoin: "onboardingChoose",
  onboardingChoose: "onboardingWelcome",
};

/**
 * Стек истории переходов между экранами.
 */
export const tabHistory: Tab[] = [];
let previousTab: Tab = "statsScreen";
let isNavigatingBack = false;

// Отслеживание изменений activeTab для формирования истории
activeTab.subscribe((newTab) => {
  if (newTab === previousTab) return;

  if (isNavigatingBack) {
    isNavigatingBack = false;
  } else if (tabHistory.length > 0 && tabHistory[tabHistory.length - 1] === newTab) {
    // Пользователь нажал кнопку «Назад» в самом интерфейсе
    tabHistory.pop();
  } else if (ROOT_TABS.includes(newTab) && ROOT_TABS.includes(previousTab)) {
    // Переключение между вкладками нижней панели
    if (newTab === "statsScreen") {
      tabHistory.length = 0;
    } else {
      tabHistory.length = 0;
      tabHistory.push("statsScreen");
    }
  } else {
    tabHistory.push(previousTab);
  }

  previousTab = newTab;
  notifyNativeNavigation();
});

/**
 * Проверка, является ли вкладка главной (Home).
 */
export function isMainTab(tab: Tab): boolean {
  return tab === "statsScreen";
}

type ModalCloseCallback = () => void;
const modalStack: ModalCloseCallback[] = [];
export const openModalsCount = writable<number>(0);

type CustomBackHandler = () => boolean | void;
const customBackHandlers: CustomBackHandler[] = [];

/**
 * Регистрация кастомного обработчика назад (для текущего экрана).
 */
export function registerBackHandler(handler: CustomBackHandler): () => void {
  customBackHandlers.push(handler);
  notifyNativeNavigation();
  return () => {
    const idx = customBackHandlers.indexOf(handler);
    if (idx !== -1) {
      customBackHandlers.splice(idx, 1);
      notifyNativeNavigation();
    }
  };
}

/**
 * Регистрация открытого модального окна в стеке.
 */
export function registerModal(onClose: ModalCloseCallback): () => void {
  modalStack.push(onClose);
  openModalsCount.set(modalStack.length);
  notifyNativeNavigation();

  return () => {
    const idx = modalStack.indexOf(onClose);
    if (idx !== -1) {
      modalStack.splice(idx, 1);
      openModalsCount.set(modalStack.length);
      notifyNativeNavigation();
    }
  };
}

/**
 * Закрытие самого верхнего открытого модального окна.
 */
export function closeTopModal(): boolean {
  const closer = modalStack.pop();
  if (closer) {
    closer();
    openModalsCount.set(modalStack.length);
    notifyNativeNavigation();
    return true;
  }
  return false;
}

/**
 * Проверка, есть ли куда вернуться назад.
 */
export function canNavigateBack(): boolean {
  let count = 0;
  openModalsCount.subscribe((c) => (count = c))();
  if (count > 0) return true;

  if (customBackHandlers.length > 0) return true;

  let currentTab: Tab = "statsScreen";
  activeTab.subscribe((t) => (currentTab = t))();

  if (tabHistory.length > 0) return true;
  if (screenParents[currentTab]) return true;
  if (currentTab !== "statsScreen") return true;

  return false;
}

/**
 * Переход на предыдущий экран в соответствии с историей или иерархией.
 */
export function navigateBack(): boolean {
  // Приоритет 1: Закрытие открытого модального окна
  if (closeTopModal()) {
    return true;
  }

  // Приоритет 2: Кастомный обработчик экрана
  if (customBackHandlers.length > 0) {
    const handler = customBackHandlers[customBackHandlers.length - 1];
    const handled = handler();
    if (handled !== false) {
      notifyNativeNavigation();
      return true;
    }
  }

  let current: Tab = "statsScreen";
  activeTab.subscribe((t) => (current = t))();

  // Приоритет 3: Стек истории переходов
  while (tabHistory.length > 0 && tabHistory[tabHistory.length - 1] === current) {
    tabHistory.pop();
  }

  if (tabHistory.length > 0) {
    const target = tabHistory.pop()!;
    isNavigatingBack = true;
    activeTab.set(target);
    notifyNativeNavigation();
    return true;
  }

  // Приоритет 4: Иерархический родительский экран (fallback)
  const parent = screenParents[current];
  if (parent && parent !== current) {
    isNavigatingBack = true;
    activeTab.set(parent);
    notifyNativeNavigation();
    return true;
  }

  // Приоритет 5: Возврат на главную вкладку из вторичных корневых вкладок
  if (current !== "statsScreen" && ROOT_TABS.includes(current)) {
    isNavigatingBack = true;
    activeTab.set("statsScreen");
    notifyNativeNavigation();
    return true;
  }

  // Приоритет 6: На главном экране без модалок — системное действие
  notifyNativeNavigation();
  return false;
}

/**
 * Уведомление AndroidBridge об изменении состояния навигации.
 */
export function notifyNativeNavigation() {
  if (
    typeof window !== "undefined" &&
    (window as any).AndroidBridge &&
    typeof (window as any).AndroidBridge.updateNavigationState === "function"
  ) {
    let currentTab: Tab = "statsScreen";
    activeTab.subscribe((t) => (currentTab = t))();
    let count = 0;
    openModalsCount.subscribe((c) => (count = c))();
    const canBack = canNavigateBack();

    try {
      (window as any).AndroidBridge.updateNavigationState(count > 0, currentTab, canBack);
    } catch {
      (window as any).AndroidBridge.updateNavigationState(count > 0, currentTab);
    }
  }
}


export const onboardingParams = writable<{
  familyForm: {
    name: string;
    icon: string;
    icon_color: string;
    icon_bg: string;
  };
}>({
  familyForm: {
    name: "",
    icon: "material-symbols:family-group",
    icon_color: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
    icon_bg: "linear-gradient(135deg, #413a34 0%, #2b2622 100%)",
  },
});

export const createPlannedChoreParams = writable<{
  chore?: ChoreItem;
  isQuickTask?: boolean;
}>({});

export const detailPlannedChoreParams = writable<{
  plannedChore?: AnyPlannedChore;
}>({});

export const choreDetailParams = writable<{
  chore?: ChoreItem;
}>({});

export const choreEditParams = writable<{
  chore?: ChoreItem;
  fromTemplate?: boolean;
}>({});
