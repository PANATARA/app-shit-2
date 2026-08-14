// stores/family.ts
import { getFamilyStats, getFamilyLeader } from "$api/family";
import { getProfile } from "$api/me";
import { swr } from "$lib/swr";

export const profileSWR = swr("profile", getProfile);
export const leadersSWR = swr("family-leaders", getFamilyLeader);
export const statsSWR = swr("family-stats", getFamilyStats);
