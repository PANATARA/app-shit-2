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
  | "choreTemplatesScreen";

export const activeTab = writable<Tab>("statsScreen");

export const createPlannedChoreParams = writable<{
  chore?: ChoreItem;
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
