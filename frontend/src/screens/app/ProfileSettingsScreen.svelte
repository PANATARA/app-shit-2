<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getFamily, getFamilyMembers } from "$api/family";
    import { getProfile, updateProfile } from "$api/me";
    import UserAvatar from "$ui/UserAvatar.svelte";
    import Block from "$ui/block.svelte";
    import Card from "$ui/Card.svelte";
    import CustButton from "$ui/button.svelte";
    import Icon from "@iconify/svelte";
    import AvatarBuilder from "$features/settings/AvatarBuilder.svelte";
    import InviteModal from "$screens/modal/InviteModal.svelte";
    import LangModal from "$screens/modal/LangModal.svelte";
    import ThemeModal from "$screens/modal/ThemeModal.svelte";
    import { theme, language, openProfile } from "$lib/settings.js";
    import { userSession, clearTokens } from "$api/client";
    import { logoutFromFamily } from "$api/family";
    import FamilyMembersSkeleton from "$skeletons/FamilyMembersSkeleton.svelte";
    import ProfileSkeleton from "$skeletons/ProfileSkeleton.svelte";
    import { swr, mutate } from "$lib/swr";
    import { activeTab } from "$lib/navigation";
    import { t } from "$lib/i18n";

    const dispatch = createEventDispatcher();

    // ─── MODALS ────────────────────────────────────
    let inviteModalOpen = false;
    let languageModalOpen = false;
    let themeModalOpen = false;

    // ─── EDIT ──────────────────────────────────────
    let isEditing = false;
    let editName = "";
    let editSurname = "";
    let editAvatar = { icon: "", icon_color: "", icon_bg: "" };

    const appVersion = "1.0.0";

    // ─── DATA ──────────────────────────────────────
    const profile = swr("profile", getProfile);
    const family = swr("family", getFamily);
    const members = swr("family-members", getFamilyMembers);

    $: meUser = $profile.data;
    $: familyMembers = $members.data?.members ?? [];
    $: profileLoading = $profile.loading;
    $: familyLoading = $family.loading || $members.loading;
    $: fullName = meUser ? `${meUser.name} ${meUser.surname}`.trim() : "";

    // ─── EDIT LOGIC ────────────────────────────────
    function openEdit() {
        if (!meUser) return;
        editName = meUser.name;
        editSurname = meUser.surname;
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
        const updated = await updateProfile({
            name: editName,
            surname: editSurname,
            ...editAvatar,
        });
        meUser = updated;
        mutate("profile", updated);
        isEditing = false;
    }

    async function handleLeaveFamily() {
        if (!confirm($t.settings.leaveConfirm)) return;
        try {
            await logoutFromFamily();
            dispatch("family-left");
        } catch (e) {
            console.error(e);
        }
    }

    function handleLogout() {
        if (!confirm($t.settings.logoutConfirm)) return;
        clearTokens();
        dispatch("logout");
    }
</script>

<div class="screen">

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
                    <input id="edit-profile-name" class="field-input" bind:value={editName} />
                </div>
                <div class="field">
                    <label class="field-label" for="edit-profile-surname">{$t.settings.lastName}</label>
                    <input id="edit-profile-surname" class="field-input" bind:value={editSurname} />
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
        background: var(--bg);
        min-height: 100vh;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-family: system-ui, sans-serif;
    }

    .section-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin: 12px 16px 4px;
    }

    /* PROFILE */

    .profile-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    .avatar-wrap {
        position: relative;
        display: inline-block;
    }

    .edit-icon-btn {
        position: absolute;
        bottom: -4px;
        right: -4px;
        width: 30px;
        height: 30px;
        border-radius: 9px;
        background: var(--accent);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s ease;
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
        border: 1.5px solid var(--border);
        border-radius: 14px;
        padding: 11px 14px;
        color: var(--text-primary);
        font-size: 15px;
        font-family: inherit;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.15s ease;
    }

    .field-input:focus { border-color: var(--accent); }

    .edit-actions {
        display: flex;
        gap: 10px;
        margin-top: 8px;
    }

    .btn-cancel {
        flex: 1;
        padding: 13px;
        background: var(--surface-alt);
        border: none;
        border-radius: 20px;
        color: var(--text-muted);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: opacity 0.15s ease;
    }

    .btn-cancel:active { opacity: 0.7; }

    .btn-save {
        flex: 2;
        padding: 13px;
        background: var(--accent);
        border: none;
        border-radius: 20px;
        color: #2a1800;
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: opacity 0.15s ease;
    }

    .btn-save:active { opacity: 0.8; }

    /* ROWS */

    .btn-row {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        background: transparent;
        border: none;
        text-align: left;
        cursor: pointer;
    }

    .btn-row:focus { outline: none; }
    .btn-row:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

    .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
    }

    button.row {
        width: 100%;
        border: none;
        background: transparent;
        text-align: left;
        font-family: inherit;
    }

    .clickable {
        cursor: pointer;
        transition: opacity 0.15s ease;
    }

    .clickable:active { opacity: 0.65; }

    .row-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: var(--surface-alt);
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
    }

    /* INVITE */

    .invite-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 600;
        color: var(--accent);
        flex-shrink: 0;
    }

    .invite-title { color: var(--accent) !important; }
    .invite-arrow { color: var(--accent) !important; opacity: 0.6; }

    /* DANGER */

    .danger-rows {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }
</style>
