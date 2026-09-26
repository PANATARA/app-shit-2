<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import Block from "$ui/block.svelte";
    import Card from "$ui/Card.svelte";
    import CustButton from "$ui/button.svelte";
    import Icon from "@iconify/svelte";
    import AvatarBuilder from "$features/settings/AvatarBuilder.svelte";
    import InviteModal from "./InviteModal.svelte";
    import LangModal from "./LangModal.svelte";
    import ThemeModal from "./ThemeModal.svelte";
    import {
        useMyProfile,
        useFamily,
        useFamilyMembers,
        updateMyProfile,
        leaveFamily,
    } from "$lib/familyStore";
    import { theme, language, openProfile } from "$lib/settings.js";
    import { userSession, clearTokens } from "$api/client";
    import FamilyMembersSkeleton from "$skeletons/FamilyMembersSkeleton.svelte";
    import ProfileSkeleton from "$skeletons/ProfileSkeleton.svelte";
    import { activeTab } from "$lib/navigation";
    import { t } from "$lib/i18n";
    import {
        sendTestPush,
        unregisterPushToken,
        registerPushToken,
        getStoredFcmToken,
    } from "$lib/pushNotifications";

    const dispatch = createEventDispatcher();

    // ─── MODALS ────────────────────────────────────
    let inviteModalOpen = false;
    let languageModalOpen = false;
    let themeModalOpen = false;

    // ─── EDIT ──────────────────────────────────────
    let isEditing = false;
    let editName = "";
    let editAvatar = { icon: "", icon_color: "", icon_bg: "" };

    // ─── NOTIFICATION TEST ─────────────────────────
    let isSendingPush = false;
    let pushResult: { success: boolean; message: string } | null = null;

    const appVersion = "1.0.0";

    // ─── DATA ──────────────────────────────────────
    const profile = useMyProfile();
    const family = useFamily();
    const members = useFamilyMembers();

    $: meUser = $profile.data;
    $: familyMembers = $members.data?.members ?? [];
    $: profileLoading = $profile.loading;
    $: familyLoading = $family.loading || $members.loading;
    $: fullName = meUser ? meUser.name.trim() : "";

    // ─── EDIT LOGIC ────────────────────────────────
    function openEdit() {
        if (!meUser) return;
        editName = meUser.name;
        editAvatar = {
            icon: meUser.icon,
            icon_color: meUser.icon_color,
            icon_bg: meUser.icon_bg,
        };
        isEditing = true;
    }

    function cancelEdit() {
        isEditing = false;
    }

    async function saveEdit() {
        if (!meUser) return;
        const updated = await updateMyProfile({
            name: editName.trim(),
            ...editAvatar,
        });
        meUser = updated;
        isEditing = false;
    }

    async function handleLeaveFamily() {
        if (!confirm($t.settings.leaveConfirm)) return;
        try {
            await leaveFamily();
            dispatch("family-left");
        } catch (e) {
            console.error(e);
        }
    }

    async function handleLogout() {
        if (!confirm($t.settings.logoutConfirm)) return;
        try {
            await unregisterPushToken();
        } catch (e) {
            console.warn("Unregister push token on logout failed:", e);
        }
        clearTokens();
        dispatch("logout");
    }

    async function handleSendTestPush() {
        if (isSendingPush) return;
        isSendingPush = true;
        pushResult = null;
        try {
            const existingToken = getStoredFcmToken();
            if (!existingToken) {
                const mockToken = `fcm_dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                await registerPushToken(mockToken);
            }
            const res = await sendTestPush();
            if (res.fcm_available && res.delivery?.success > 0) {
                pushResult = {
                    success: true,
                    message: `${$t.settings.testNotificationSuccess} (${res.delivery.success}/${res.delivery.total})`,
                };
            } else if (!res.fcm_available) {
                pushResult = {
                    success: false,
                    message: $t.settings.fcmNotConfigured,
                };
            } else if (res.delivery?.total === 0) {
                pushResult = {
                    success: false,
                    message: $t.settings.noDevicesRegistered,
                };
            } else {
                pushResult = {
                    success: false,
                    message: `${$t.settings.testNotificationFailed} (${res.delivery?.failure || 0} failed)`,
                };
            }
        } catch (e: any) {
            pushResult = {
                success: false,
                message: e?.data?.serviceError || e?.message || $t.settings.testNotificationFailed,
            };
        } finally {
            isSendingPush = false;
        }
    }
</script>

<div class="screen">
    <header class="hub-header">
        <div class="hub-title-row">
            <div class="title-wrap">
                <h1 class="hub-title">{$t.nav.profile}</h1>
                <span class="hub-subtitle">{$t.settings.manageAccount || "Семья, профиль и настройки"}</span>
            </div>
        </div>
    </header>

    <!-- ПРОФИЛЬ -->
    {#if profileLoading}
        <Card glowDirection="top-right">
            <ProfileSkeleton />
        </Card>
    {:else if isEditing}
        <Card glowDirection="top-left">
            <div class="edit-avatar-wrap">
                <AvatarBuilder
                    initialIcon={editAvatar.icon}
                    initialIconColor={editAvatar.icon_color}
                    initialBg={editAvatar.icon_bg}
                    onchange={(v) => (editAvatar = v)}
                    allowIconColor={false}
                    iconCategories={["pets"]}
                />
            </div>
            <div class="edit-fields">
                <div class="field">
                    <label class="field-label" for="edit-profile-name">{$t.settings.firstName}</label>
                    <input id="edit-profile-name" class="field-input" maxlength="50" bind:value={editName} />
                </div>
            </div>
            <div class="edit-actions">
                <button class="btn-cancel" onclick={cancelEdit}>{$t.common.cancel}</button>
                <button class="btn-save" onclick={saveEdit}>{$t.common.save}</button>
            </div>
        </Card>
    {:else}
        <Card glowDirection="top-right">
            <div class="profile-header">
                <div class="avatar-wrap">
                    <UserAvatar user={meUser} size={100} />
                    <button class="edit-icon-btn" onclick={openEdit} aria-label={$t.settings.editProfile}>
                        <Icon icon="material-symbols:edit-square" width={18} height={18} color="white" />
                    </button>
                </div>
                <div class="profile-info">
                    <div class="profile-name">{fullName}</div>
                </div>
            </div>
        </Card>
    {/if}

    <!-- УЧАСТНИКИ СЕМЬИ -->
    <div class="section-label">{$t.settings.familyMembers}</div>
    {#if familyLoading}
        <Block>
            <FamilyMembersSkeleton />
        </Block>
    {:else}
        <Block>
            {#each familyMembers as member (member.id)}
                <button type="button" class="row clickable" onclick={() => openProfile(member.id)}>
                    <UserAvatar user={member} size={30} />
                    <div class="row-text">
                        <div class="row-title">
                            {member.name}
                            {#if member.id === $userSession.userId}
                                <span class="you-badge">{$t.common.you}</span>
                            {/if}
                        </div>
                    </div>
                    <span class="arrow">›</span>
                </button>
            {/each}

            <button type="button" class="row clickable invite-row" onclick={() => (inviteModalOpen = true)}>
                <div class="invite-icon">+</div>
                <div class="row-text">
                    <div class="row-title invite-title">{$t.settings.inviteMember}</div>
                </div>
                <span class="arrow invite-arrow">›</span>
            </button>
        </Block>
    {/if}

    <!-- НАСТРОЙКИ СЕМЬИ -->
    <div class="section-label">{$t.settings.familyChores}</div>
    <Block>
        <button class="btn-row" onclick={() => activeTab.set("choreListScreen")}>
            <div class="row-icon">
                <Icon icon="material-symbols:format-list-bulleted-rounded" width={24} height={24} />
            </div>
            <div class="row-text">
                <div class="row-title">{$t.chores.myChores}</div>
            </div>
            <span class="arrow">›</span>
        </button>
    </Block>

    <!-- НАСТРОЙКИ -->
    <div class="section-label">{$t.settings.language} & {$t.settings.theme}</div>
    <Block>
        <button class="btn-row" onclick={() => (languageModalOpen = true)}>
            <div class="row-icon">
                <Icon icon="material-symbols:language" width={24} height={24} />
            </div>
            <div class="row-text"><div class="row-title">{$t.settings.language}</div></div>
            <div class="row-right">{$language === "ru" ? "Русский" : "English"}</div>
            <span class="arrow">›</span>
        </button>

        <button class="btn-row" onclick={() => (themeModalOpen = true)}>
            <div class="row-icon">
                <Icon icon="material-symbols:palette" width={24} height={24} />
            </div>
            <div class="row-text"><div class="row-title">{$t.settings.theme}</div></div>
            <div class="row-right">{$theme}</div>
            <span class="arrow">›</span>
        </button>

        <div class="row">
            <div class="row-icon">
                <Icon icon="material-symbols:info-rounded" width={24} height={24} />
            </div>
            <div class="row-text"><div class="row-title">{$t.settings.version}</div></div>
            <div class="row-right">{appVersion}</div>
        </div>
    </Block>

    <!-- ТЕСТ УВЕДОМЛЕНИЙ (DEV) -->
    <div class="section-label">{$t.settings.notificationsTest}</div>
    <Block padding={12}>
        <div class="test-push-wrap">
            <button
                type="button"
                class="btn-row test-push-btn clickable"
                onclick={handleSendTestPush}
                disabled={isSendingPush}
            >
                <div class="row-icon notification-icon">
                    <Icon icon="material-symbols:notifications-active-rounded" width={22} height={22} />
                </div>
                <div class="row-text">
                    <div class="row-title">
                        {isSendingPush ? $t.settings.sendingNotification : $t.settings.sendTestNotification}
                    </div>
                </div>
                {#if isSendingPush}
                    <div class="push-spinner"></div>
                {:else}
                    <span class="arrow">›</span>
                {/if}
            </button>

            {#if pushResult}
                <div class="push-status-card {pushResult.success ? 'status-success' : 'status-warning'}">
                    <div class="status-icon">
                        <Icon icon={pushResult.success ? "material-symbols:check-circle-rounded" : "material-symbols:info-rounded"} width={20} height={20} />
                    </div>
                    <div class="status-content">
                        <div class="status-msg">{pushResult.message}</div>
                    </div>
                </div>
            {/if}
        </div>
    </Block>

    <!-- АККАУНТ -->
    <div class="section-label">{$t.settings.account}</div>
    <Block padding={10}>
        <div class="danger-rows">
            <CustButton label={$t.settings.leaveFamily} variant="danger" onClick={handleLeaveFamily} />
            <CustButton label={$t.settings.logout} variant="danger" onClick={handleLogout} />
        </div>
    </Block>

</div>

{#if inviteModalOpen}
    <InviteModal on:close={() => (inviteModalOpen = false)} />
{:else if languageModalOpen}
    <LangModal on:close={() => (languageModalOpen = false)} />
{:else if themeModalOpen}
    <ThemeModal on:close={() => (themeModalOpen = false)} />
{/if}

<style>
    .screen {
        background: transparent;
        min-height: 100%;
        padding: 12px 14px 24px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        font-family: inherit;
    }

    .hub-header {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 2px;
    }

    .hub-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .title-wrap {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .hub-title {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
        margin: 0;
        color: var(--text-primary);
    }

    .hub-subtitle {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-muted);
    }

    .section-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin: 8px 12px 2px;
    }

    /* PROFILE */

    .profile-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
    }

    .avatar-wrap {
        position: relative;
        display: inline-block;
    }

    .edit-icon-btn {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 32px;
        height: 32px;
        border-radius: 999px;
        background: var(--accent-gradient, var(--accent));
        box-shadow: var(--shadow-ambient);
        border: 2px solid var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .edit-icon-btn:active { transform: scale(0.9); }

    .profile-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .profile-name {
        font-size: 22px;
        font-weight: 800;
        letter-spacing: -0.4px;
        color: var(--text-primary);
    }

    /* EDIT */

    .edit-avatar-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 16px;
    }

    .edit-fields {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .field-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: var(--text-muted);
    }

    .field-input {
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        border-radius: 14px;
        padding: 12px 14px;
        color: var(--text-primary);
        font-size: 15px;
        font-family: inherit;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .field-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
    }

    .edit-actions {
        display: flex;
        gap: 10px;
        margin-top: 12px;
    }

    .btn-cancel {
        flex: 1;
        padding: 13px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        border-radius: 999px;
        color: var(--text-muted);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease;
    }

    .btn-cancel:active {
        transform: scale(0.97);
        opacity: 0.8;
    }

    .btn-save {
        flex: 2;
        padding: 13px;
        background: var(--accent-gradient, var(--accent));
        border: none;
        border-radius: 999px;
        color: #ffffff;
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        box-shadow: var(--shadow-floating);
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease;
    }

    .btn-save:active {
        transform: scale(0.97);
        opacity: 0.9;
    }

    /* ROWS */

    .btn-row {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--border-subtle);
        text-align: left;
        cursor: pointer;
        border-radius: 12px;
        transition: background-color 0.15s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .btn-row:last-child {
        border-bottom: none;
    }

    .btn-row:focus { outline: none; }
    .btn-row:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .btn-row:active {
        background: var(--surface-alt);
        transform: scale(0.985);
    }

    .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-bottom: 1px solid var(--border-subtle);
        border-radius: 12px;
        transition: background-color 0.15s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .row:last-child {
        border-bottom: none;
    }

    button.row {
        width: 100%;
        border-top: none;
        border-left: none;
        border-right: none;
        background: transparent;
        text-align: left;
        font-family: inherit;
    }

    .clickable {
        cursor: pointer;
    }

    .clickable:active {
        background: var(--surface-alt);
        transform: scale(0.985);
    }

    .row-icon {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent);
        flex-shrink: 0;
    }

    .row-text {
        flex: 1;
        min-width: 0;
    }

    .row-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .row-right {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-muted);
        flex-shrink: 0;
    }

    .arrow {
        font-size: 18px;
        color: var(--text-muted);
        opacity: 0.4;
        flex-shrink: 0;
    }

    .you-badge {
        color: var(--text-muted);
        font-weight: 400;
        font-size: 12px;
        margin-left: 4px;
    }

    /* INVITE */

    .invite-icon {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--accent) 14%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 600;
        color: var(--accent);
        flex-shrink: 0;
    }

    .invite-title {
        color: var(--accent) !important;
        font-weight: 700;
    }
    .invite-arrow { color: var(--accent) !important; opacity: 0.7; }

    /* DANGER */

    .danger-rows {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }

    /* PUSH NOTIFICATIONS TEST */
    .test-push-wrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }

    .test-push-btn {
        background: transparent;
        border: none;
        padding: 4px 0;
        cursor: pointer;
        text-align: left;
    }

    .notification-icon {
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        border-color: color-mix(in srgb, var(--accent) 25%, transparent);
    }

    .push-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--border-subtle);
        border-top-color: var(--accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        flex-shrink: 0;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .push-status-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.4;
    }

    .status-success {
        background: color-mix(in srgb, #10B981 12%, transparent);
        border: 1px solid color-mix(in srgb, #10B981 30%, transparent);
        color: #10B981;
    }

    .status-warning {
        background: color-mix(in srgb, #F59E0B 12%, transparent);
        border: 1px solid color-mix(in srgb, #F59E0B 30%, transparent);
        color: #F59E0B;
    }

    .status-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    .status-content {
        flex: 1;
        min-width: 0;
    }

    .status-msg {
        font-weight: 500;
        word-break: break-word;
    }
</style>
