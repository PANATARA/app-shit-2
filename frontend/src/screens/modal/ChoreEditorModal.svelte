<script lang="ts">
    import Icon from "@iconify/svelte";
    import { fade, fly } from "svelte/transition";

    import {
        getChores,
        deleteChore,
        updateChore,
        createChore,
        createChoresFromDefault,
        getDefaultChores,
    } from "$api/chores";

    import { swr } from "$lib/swr";

    import type { ChoreItem, DefaultChore } from "$types/index";

    import SearchBox from "$ui/SearchBox.svelte";
    import Backbtn from "$ui/backbtn.svelte";
    import AsyncStateView from "$ui/AsyncStateView.svelte";

    import ChoreIcon from "$ui/ChoreIcon.svelte";
    import ChoreListItem from "$features/chores/ChoreListItem.svelte";
    import DefaultChoreListItem from "$features/chores/DefaultChoreListItem.svelte";
    import ChoreFormComp from "$features/settings/ChoreForm.svelte";

    type Step = "list" | "detail" | "templates" | "create";

    let step: Step = "list";

    let searchQuery = "";

    let selectedChore: ChoreItem | null = null;

    let isEditing = false;

    let saving = false;
    let deleting = false;

    const choresStore = swr("chores", getChores);

    const templatesStore = swr("default-chores", getDefaultChores);

    $: chores = $choresStore.data?.chores ?? [];

    $: templates = $templatesStore.data ?? [];

    $: filtered = chores.filter((x) =>
        x.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    let form = {
        name: "",
        description: "",
        icon: "material-symbols:home-rounded",
        icon_color: "#000",
        icon_bg: "#fff",
        valuation: 10,
    };

    function openDetail(chore: ChoreItem) {
        selectedChore = chore;
        isEditing = false;
        step = "detail";
    }

    function resetForm() {
        form = {
            name: "",
            description: "",
            icon: "material-symbols:home-rounded",
            icon_color: "#000",
            icon_bg: "#fff",
            valuation: 10,
        };
    }

    function createNew() {
        resetForm();
        step = "create";
    }

    function back() {
        if (step === "detail") {
            step = "list";
            return;
        }

        if (step === "templates") {
            step = "list";
            return;
        }

        if (step === "create") {
            step = "templates";
        }
    }

    async function save() {
        saving = true;

        try {
            const created = await createChore(form);

            await choresStore.revalidate();

            step = "list";
        } finally {
            saving = false;
        }
    }

    async function remove() {
        if (!selectedChore) return;

        deleting = true;

        try {
            await deleteChore(selectedChore.id);

            await choresStore.revalidate();

            step = "list";
        } finally {
            deleting = false;
        }
    }
</script>

<div class="page">
    <header>
        {#if step !== "list"}
            <Backbtn label="Назад" on:click={back} />
        {/if}

        <h1>
            {#if step === "list"}
                Мои дела
            {:else if step === "detail"}
                {selectedChore?.name}
            {:else if step === "templates"}
                Шаблоны
            {:else}
                Новое дело
            {/if}
        </h1>
    </header>

    <div class="content">
        {#if step === "list"}
            <SearchBox bind:searchQuery />

            <button class="add" on:click={() => (step = "templates")}>
                <span>＋</span>

                Добавить новое дело
            </button>

            <AsyncStateView
                loading={$choresStore.loading}
                error={$choresStore.error}
                empty={filtered.length === 0}
                emptyMessage="Дел пока нет"
            >
                <div class="label">Мои дела</div>

                <div class="list">
                    {#each filtered as chore}
                        <ChoreListItem
                            {chore}
                            on:click={() => openDetail(chore)}
                        />
                    {/each}
                </div>
            </AsyncStateView>
        {:else if step === "detail"}
            <div class="detail" in:fly={{ y: 30, duration: 200 }}>
                <ChoreIcon chore={selectedChore} size={90} />

                <h2>
                    {selectedChore?.name}
                </h2>

                <p>
                    {selectedChore?.description}
                </p>

                <div class="actions">
                    <button
                        class="edit"
                        on:click={() => {
                            isEditing = true;
                            step = "create";
                        }}
                    >
                        Редактировать
                    </button>

                    <button
                        class="delete"
                        disabled={deleting}
                        on:click={remove}
                    >
                        Удалить
                    </button>
                </div>
            </div>
        {:else if step === "templates"}
            <button class="add" on:click={createNew}> ✏️ Создать своё </button>

            <div class="label">Стандартные дела</div>

            <div class="list">
                {#each templates as item}
                    <DefaultChoreListItem chore={item} />
                {/each}
            </div>
        {:else if step === "create"}
            <ChoreFormComp
                bind:form
                mode="create"
                {saving}
                submitText="Создать"
                onSubmit={save}
                onCancel={back}
            />
        {/if}
    </div>
</div>

<style>
    .page {
        height: 100dvh;
        display: flex;
        flex-direction: column;
        background: var(--bg);
    }

    header {
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        flex-shrink: 0;
    }

    header h1 {
        font-size: 17px;
        font-weight: 700;
    }

    .content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
    }

    .add {
        width: 100%;
        padding: 14px;
        border-radius: 18px;

        background: var(--accent-soft);

        color: var(--accent);

        border: 1px dashed var(--accent);

        font-weight: 700;

        margin-bottom: 18px;
    }

    .label {
        font-size: 11px;
        font-weight: 700;

        color: var(--text-muted);

        text-transform: uppercase;

        margin-bottom: 10px;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .detail {
        display: flex;
        flex-direction: column;
        align-items: center;

        gap: 18px;
    }

    .actions {
        width: 100%;
        display: flex;
        gap: 10px;
    }

    .actions button {
        flex: 1;
        padding: 14px;

        border-radius: 16px;

        font-weight: 700;
    }

    .edit {
        background: var(--accent-soft);

        color: var(--accent);
    }

    .delete {
        background: rgba(255, 80, 80, 0.1);

        color: #ff5555;
    }
</style>
