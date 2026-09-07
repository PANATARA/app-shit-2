export interface UserShort {
  id: string;
  username: string;
  name: string;
  surname: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  surname: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
  experience: number;
  level: number;
  exp_to_next_total: number;
  progress_percent: number;
  is_max_level: boolean;
  is_family_member: boolean;
  is_family_admin: boolean;
}

export interface UserProfileStats extends UserProfile {
  total_completed: number;
  week_completed: number;
  month_completed: number;
}

export interface FamilyProfile {
  id: string;
  name: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
  experience: number;
}

export interface FamilyStatsProfile {
  id: string;
  name: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
  experience: number;
  members_count: number;
  total_completed: number;
  week_completed: number;
  streak: number;
}

export interface FamilyMembers {
  members: UserShort[];
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
  default_chore_id: number | null;
}

export interface QuickPlannedChore {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    icon_color: string;
    icon_bg: string;
    valuation: number;
    completed_by: UserShort | null;
    assigned_to: UserShort | null;
    due_date: string;
    message: string;
    is_quick: true; // маркер чтобы различать типы
}

// PlannedChore тоже нужен маркер
export interface PlannedChore {
    id: string;
    schedule_id?: string | null;
    chore: ChoreItem;
    completed_by: UserShort | null;
    assigned_to: UserShort | null;
    due_date: string;
    status: string;
    message: string;
    is_quick?: false;
}

export type AnyPlannedChore = PlannedChore | QuickPlannedChore;

export interface ChoreCompletionStat {
  chore_id: string;
  chores_completions_counts: number;
}

export interface StatFilters {
  start_date?: string; // "YYYY-MM-DD"
  end_date?: string;
}

export interface FamilyCreateForm {
  name: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
}

export interface FamilyLeader {
  member: UserProfile;
  chore_completion_count: number;
}

export interface WeeklyLeadersResponse {
  leaders: FamilyLeader[];
}

export interface FamilyEvent {
  id: string;
  name: string;
  description: string | null;
  icon: string; // iconify id, напр. "material-symbols:pool"
  icon_color: string;
  icon_bg: string; // css цвет фона
  date: string; // ISO "2026-08-28"
}

export interface ChoreForm {
  name: string;
  description: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
  valuation: number;
}

export interface ChoreSchedule {
  id: string;
  chore_id: string;
  family_id: string;
  assigned_to_id: string;
  frequency_type: "daily" | "weekly" | "monthly";
  interval: number;
  days_of_week: number | null;
  day_of_month: number | null;
  starts_at: string;
  ends_at: string | null;
  last_generated_until?: string | null;
  is_active: boolean;
  created_by?: string | null;
}

export interface ChoreScheduleCreate {
  assigned_to_id: string;
  frequency_type: "daily" | "weekly" | "monthly";
  interval: number;
  days_of_week?: number | null;
  day_of_month?: number | null;
  starts_at: string;
  ends_at?: string | null;
}

export interface ChoreScheduleUpdate {
  assigned_to_id?: string;
  frequency_type?: "daily" | "weekly" | "monthly";
  interval?: number;
  days_of_week?: number | null;
  day_of_month?: number | null;
  starts_at?: string;
  ends_at?: string | null;
  is_active?: boolean;
}
