<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import BottomSheet from "$ui/BottomSheet.svelte";
    import { getUserProfile } from "$api/me";
    import { kickFamilyMember, changeFamilyAdmin } from "$api/family";
    import type { UserProfile } from "$types/index";
    import { userSession } from "$api/client";
    import CustButton from "$ui/button.svelte";
    import UserProfileCard from "$features/common/UserProfileCard.svelte";

    const dispatch = createEventDispatcher();

    export let userId: string;
    let user: UserProfile;
    let loading = true;
    let error = false;

    onMount(loadData);

    async function loadData() {
        loading = true;
        error = false;

        try {
            user = await getUserProfile(userId);
        } catch (e) {
            console.error(e);
            error = true;
        } finally {
            loading = false;
        }
    }

    function close() {
        dispatch("close");
    }
    async function handleKickMember() {
        try {
            await kickFamilyMember(userId);

            // закрываем профиль после успешного удаления
            dispatch("close");

            // можно отправить событие родителю для обновления списка
            dispatch("updated");
        } catch (e) {
            console.error("Ошибка при исключении пользователя:", e);
        }
    }

    async function handleChangeAdmin() {
        try {
            await changeFamilyAdmin(userId);

            dispatch("updated");

            // закрываем профиль
            dispatch("close");
        } catch (e) {
            console.error("Ошибка при смене администратора:", e);
        }
    }
</script>

<BottomSheet title="" on:close={close} flyY={999} flyDuration={320}>
    <div class="content">
        <UserProfileCard {user} {loading} />

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
</BottomSheet>

<style>
    .content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 4px 16px 8px;
    }
    /* ── Actions ───────────────────────── */

    .actions-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 4px;
        padding-bottom: 8px;
    }
</style>
