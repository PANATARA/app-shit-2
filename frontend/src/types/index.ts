export interface UserShort {
    id: string;
    username: string;
    name: string;
    surname: string;
    icon: string,
    icon_color: string,
    icon_bg: string,
}

export interface UserProfile {
    id: string;
    username: string;
    name: string;
    surname: string;
    icon: string,
    icon_color: string,
    icon_bg: string,
    experience: number,
    level: number,
    exp_to_next_total: number,
    progress_percent: number,
    is_max_level: boolean,
    is_family_member: boolean,
    is_family_admin: boolean
}

export interface FamilyProfile {
    id: string;
    name: string;
    icon: string,
    icon_color: string,
    icon_bg: string,
    experience: number,
}

export interface FamilyMembers {
    members: UserShort[]
}

export interface DefaultChore {
    id: string;
    icon: string;
    icon_color: string;
    icon_bg: string;
    valuation: number;
    name: string;
    description?: string;
}

export interface ChoreItem {
    id: string;
    name: string;
    icon: string;
    icon_color: string;
    icon_bg: string;
    description: string;
    valuation: number;
    usageCount: number;
}

export interface PlannedChore {
    id: string;
    chore: ChoreItem;
    completed_by: UserShort | null;
    assigned_to: UserShort | null;
    due_date: string;
    status: string;
    message: string;
}

export interface ChoreCompletionStat {
    chore_id: string;
    chores_completions_counts: number;
}

export interface StatFilters {
    start_date?: string; // "YYYY-MM-DD"
    end_date?: string;
}

