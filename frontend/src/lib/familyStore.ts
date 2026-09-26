import { swr, mutate } from "./swr";
import {
    getFamily,
    getFamilyMembers,
    createFamily as apiCreateFamily,
    logoutFromFamily as apiLogoutFromFamily,
    kickFamilyMember as apiKickFamilyMember,
    changeFamilyAdmin as apiChangeFamilyAdmin,
    generateInviteToken as apiGenerateInviteToken,
    joinFamily as apiJoinFamily,
} from "$api/family";
import { getProfile, getUserProfile, updateProfile as apiUpdateProfile } from "$api/me";
import type { FamilyProfile, FamilyMembers, UserProfile, UserProfileStats } from "$types/index";

export type { FamilyProfile, FamilyMembers, UserProfile, UserProfileStats };

// ─── Cache Invalidation Helpers ─────────────────────────────────────────────

/**
 * Инвалидирует данные семьи, участников и лидеров
 */
export function invalidateFamily() {
    mutate("family*");
    mutate("family-members*");
    mutate("family-leaders*");
    mutate("family-stats*");
    mutate("profile*");
}

/**
 * Инвалидирует только список участников
 */
export function invalidateMembers() {
    mutate("family-members*");
    mutate("family-leaders*");
    mutate("family-stats*");
}

/**
 * Инвалидирует кэш профиля текущего пользователя
 */
export function invalidateProfile(freshData?: any) {
    if (freshData) {
        mutate("profile", freshData);
    } else {
        mutate("profile*");
    }
}

// ─── SWR Store Hooks ────────────────────────────────────────────────────────

/**
 * Загружает и кэширует профиль семьи
 */
export function useFamily() {
    return swr<FamilyProfile>("family", getFamily);
}

/**
 * Загружает и кэширует список участников семьи
 */
export function useFamilyMembers() {
    return swr<FamilyMembers>("family-members", getFamilyMembers);
}

/**
 * Загружает и кэширует профиль текущего пользователя
 */
export function useMyProfile() {
    return swr<UserProfile>("profile", getProfile);
}

/**
 * Загружает и кэширует публичный профиль конкретного пользователя
 */
export function useUserProfile(userId: string) {
    return swr<UserProfileStats>(`user-profile-${userId}`, () => getUserProfile(userId));
}

// ─── Actions & Mutations ────────────────────────────────────────────────────

/**
 * Обновить профиль текущего пользователя (имя, аватар)
 */
export async function updateMyProfile(data: {
    name?: string;
    icon?: string;
    icon_color?: string;
    icon_bg?: string;
}) {
    const res = await apiUpdateProfile(data);
    invalidateProfile(res);
    invalidateMembers();
    return res;
}

/**
 * Создать новую семью
 */
export async function createNewFamily(data: {
    name: string;
    icon?: string;
    icon_color?: string;
    icon_bg?: string;
}) {
    const res = await apiCreateFamily(data);
    invalidateFamily();
    return res;
}

/**
 * Присоединиться к семье по коду приглашения
 */
export async function joinFamilyByCode(inviteCode: string) {
    const res = await apiJoinFamily({ invite_code: inviteCode });
    invalidateFamily();
    return res;
}

/**
 * Сгенерировать токен-приглашение в семью
 */
export async function generateFamilyInvite() {
    return apiGenerateInviteToken();
}

/**
 * Исключить участника из семьи (только для админа)
 */
export async function kickMember(userId: string) {
    const res = await apiKickFamilyMember(userId);
    invalidateMembers();
    mutate(`user-profile-${userId}`, null);
    return res;
}

/**
 * Передать права администратора семьи другому участнику
 */
export async function transferAdmin(userId: string) {
    const res = await apiChangeFamilyAdmin(userId);
    invalidateFamily();
    return res;
}

/**
 * Выйти из текущей семьи
 */
export async function leaveFamily() {
    const res = await apiLogoutFromFamily();
    invalidateFamily();
    return res;
}
