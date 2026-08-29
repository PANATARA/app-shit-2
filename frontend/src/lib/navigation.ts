import type { ChoreItem } from "$types/index";
import type { PlannedChore } from "$types/index";
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
  | "choreDetailScreen"
  | "choreEditScreen"
  | "choreTemplatesScreen"
  | "onboardingWelcome"
  | "onboardingChoose"
  | "onboardingCreateStep1"
  | "onboardingCreateStep2"
  | "onboardingJoin"
  | "eventCreate";

export const activeTab = writable<Tab>("statsScreen");

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
  plannedChore?: PlannedChore;
}>({});

export const choreDetailParams = writable<{
  chore?: ChoreItem;
}>({});

export const choreEditParams = writable<{
  chore?: ChoreItem;
  fromTemplate?: boolean;
}>({});
