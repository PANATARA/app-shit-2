<script lang="ts">
  export let item: any = {
    message: "Buy groceries before evening",
    chore: {
      name: "Buy groceries",
      icon: "🛒",
    },
    assigned_by: {
      name: "Alex",
      surname: "Johnson",
    },
  };

  export let onComplete: (item: any) => void;

  // Robust parsing to handle various object formats gracefully
  $: id = item.id;
  $: title = item.title || item.chore?.name || "Без названия";
  $: icon = item.icon || item.chore?.icon || "🧹";
  $: comment = item.comment || item.message || "";
  $: done = item.done || false;
  
  $: assignee = item.assignedTo || (item.assigned_by ? { 
    name: item.assigned_by.name, 
    avatar: (item.assigned_by.name?.[0] || "") + (item.assigned_by.surname?.[0] || "") 
  } : null);

  function handleComplete() {
    onComplete?.(item);
  }
</script>

<div class="card" class:card-done={done}>
  <!-- Left Side: Chore Icon with premium ambient background -->
  <div class="icon-wrapper">
    <div class="icon-inner">
      {icon}
    </div>
  </div>

  <!-- Middle Section: Main Content with beautiful typography -->
  <div class="content">
    <div class="title" class:completed-text={done}>{title}</div>
    {#if comment}
      <div class="subtitle" class:completed-text={done}>{comment}</div>
    {/if}

    {#if assignee}
      <div class="assignee-badge">
        <div class="avatar">{assignee.avatar || assignee.name?.[0] || "👤"}</div>
        <span class="name">{assignee.name}</span>
      </div>
    {/if}
  </div>

  <!-- Right Side: Circular checkbox with haptic pop-in checkmark -->
  <div class="right">
    <button 
      class="check" 
      class:checked={done} 
      on:click|stopPropagation={handleComplete} 
      aria-label="Завершить задачу"
    >
      {#if done}
        <svg class="check-icon" width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path 
            d="M1.5 5L4.5 8L10.5 2" 
            stroke="currentColor" 
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
      {/if}
    </button>
  </div>
</div>

<style>
  .card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    overflow: hidden;
  }

  .card:hover {
    transform: translateY(-2px);
    background: var(--surface-alt);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    border-color: var(--accent-soft);
  }

  .card.card-done {
    opacity: 0.65;
    background: var(--surface);
    border-color: transparent;
    box-shadow: none;
    transform: none;
  }

  /* ── ICON ───────────────────────────── */
  .icon-wrapper {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  .card:hover .icon-wrapper {
    transform: scale(1.05) rotate(4deg);
  }

  .card-done .icon-wrapper {
    background: var(--divider);
    transform: none !important;
  }

  .icon-inner {
    font-size: 24px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── CONTENT ───────────────────────────── */
  .content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
    transition: all 0.2s;
  }

  .subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: all 0.2s;
  }

  .completed-text {
    text-decoration: line-through;
    color: var(--text-muted);
  }

  /* ── ASSIGNEE BADGE ───────────────────────────── */
  .assignee-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface-alt);
    padding: 3px 8px;
    border-radius: 12px;
    align-self: flex-start;
    margin-top: 4px;
    border: 1px solid var(--border);
  }

  .card-done .assignee-badge {
    background: transparent;
    border-color: var(--border);
  }

  .avatar {
    width: 18px;
    height: 18px;
    border-radius: 6px;
    background: var(--accent);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  .card-done .avatar {
    background: var(--text-muted);
  }

  .name {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  /* ── CHECK BUTTON ───────────────────────────── */
  .right {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .check {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    padding: 0;
  }

  .check:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
    transform: scale(1.1);
  }

  .check:active {
    transform: scale(0.9);
  }

  .check.checked {
    border-color: var(--success);
    background: var(--success);
    color: #fff;
  }

  .check-icon {
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes popIn {
    0% {
      transform: scale(0) rotate(-15deg);
      opacity: 0;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
</style>