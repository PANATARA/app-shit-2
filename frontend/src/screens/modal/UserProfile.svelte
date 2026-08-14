<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getUserProfile } from "$api/me";
    import { kickFamilyMember, changeFamilyAdmin } from "$api/family";
    import { userSession } from "$api/client";
    import CustButton from "$ui/button.svelte";
    import { swr } from "$lib/swr";
    import { BottomSheet } from "svelte-bottom-sheet";
    import CompactUserProfile from "$features/users/CompactUserInfo.svelte";
    import UserStatsCard from "$features/users/UserStatsCard.svelte";

    const dispatch = createEventDispatcher();

    export let userId: string;
    export let isOpen = false;

    $: isSheetOpen = isOpen;

    const profile = swr(`user-profile-${userId}`, () => getUserProfile(userId));
    $: user = $profile.data;
    $: loading = $profile.loading;

    function handleClose() {
        isOpen = false;
        dispatch("close");
    }

    async function handleKickMember() {
        try {
            await kickFamilyMember(userId);
            isOpen = false;
            dispatch("updated");
        } catch (e) {
            console.error("Ошибка при исключении пользователя:", e);
        }
    }

    async function handleChangeAdmin() {
        try {
            await changeFamilyAdmin(userId);
            isOpen = false;
            dispatch("updated");
        } catch (e) {
            console.error("Ошибка при смене администратора:", e);
        }
    }
</script>

<BottomSheet
    bind:isSheetOpen
    settings={{ maxHeight: 0.85 }}
    onclose={handleClose}
>
    <BottomSheet.Overlay>
        <BottomSheet.Sheet>
            <BottomSheet.Handle />
            <BottomSheet.Content>
                <div class="content">
                    <CompactUserProfile
                        {user}
                        {loading}
                        unread={true}
                        onNotificationClick={() => console.log("notifications")}
                    />
                    <UserStatsCard {user} {loading} />
                    {#if $userSession.isFamilyAdmin && $userSession.userId != userId}
                        <div class="actions-card">
                            <CustButton
                                label="Сделать главой семьи"
                                variant="primary"
                                onClick={handleChangeAdmin}
                            />
                            <CustButton
                                label="Исключить из семейного круга"
                                variant="danger"
                                onClick={handleKickMember}
                            />
                        </div>
                    {/if}
                </div>
            </BottomSheet.Content>
        </BottomSheet.Sheet>
    </BottomSheet.Overlay>
</BottomSheet>

<style>
    :global(.bottom-sheet) {
        background-color: var(--surface) !important;
    }
    :global(.handle-container) {
        background-color: var(--surface) !important;
    }
    :global(.bottom-sheet-content) {
        padding: 0 !important;
        display: block !important; /* было inline-block */
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 4px 16px 8px;
    }
    .actions-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 4px;
        padding-bottom: 8px;
    }
</style>
