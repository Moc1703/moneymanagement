// Database types — hand-written to match the schema in
// supabase/migrations/0001_init_schema.sql. Will be replaced by
// `npx supabase gen types typescript` once Supabase project is connected.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AccountType = "personal" | "business";
export type CategoryType = "income" | "expense" | "both";
export type TransactionType = "income" | "expense";

export interface Profile {
  id: string;
  display_name: string;
  onboarding_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  color: string;
  icon: string;
  initial_balance: number;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  is_default: boolean;
  is_archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  project_id: string | null;
  category_id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string | null;
  transfer_group_id: string | null;
  recurring_rule_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithRelations extends Transaction {
  account: Account | null;
  project: Project | null;
  category: Category | null;
}

// -- Phase 2 — Kantong / Goals / Recurring / Hutang Piutang ------------------

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  period_month: string;
  amount: number;
  rollover: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetProgress {
  budget_id: string;
  user_id: string;
  category_id: string;
  period_month: string;
  amount: number;
  rollover: boolean;
  spent: number;
}

export type Frequency = "weekly" | "biweekly" | "monthly" | "yearly";

export interface RecurringRule {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  project_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  frequency: Frequency;
  day_of_week: number | null;
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  last_generated_until: string | null;
  skip_dates: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  account_id: string | null;
  color: string;
  icon: string;
  archived_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  goal_id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  account_id: string | null;
  color: string;
  icon: string;
  archived_at: string | null;
  current_amount: number;
  days_remaining: number | null;
}

export interface GoalContribution {
  id: string;
  user_id: string;
  goal_id: string;
  transaction_id: string | null;
  amount: number;
  contribution_date: string;
  note: string | null;
  created_at: string;
}

export type DebtDirection = "owe" | "lent";
export type DebtStatus = "open" | "partial" | "settled";

export interface Debt {
  id: string;
  user_id: string;
  counterparty: string;
  direction: DebtDirection;
  principal: number;
  due_date: string | null;
  note: string | null;
  status: DebtStatus;
  created_at: string;
  updated_at: string;
}

export interface DebtBalance {
  debt_id: string;
  user_id: string;
  counterparty: string;
  direction: DebtDirection;
  principal: number;
  due_date: string | null;
  note: string | null;
  status: DebtStatus;
  created_at: string;
  paid: number;
  outstanding: number;
}

export interface DebtPayment {
  id: string;
  user_id: string;
  debt_id: string;
  transaction_id: string | null;
  amount: number;
  payment_date: string;
  note: string | null;
  created_at: string;
}

export type AssetType = "savings" | "investment" | "gold" | "property" | "vehicle" | "crypto" | "other";
export type LiabilityType = "credit_card" | "mortgage" | "loan" | "paylater" | "other";

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  type: AssetType;
  current_value: number;
  color: string;
  icon: string;
  note: string | null;
  archived_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AssetSnapshot {
  id: string;
  user_id: string;
  asset_id: string;
  value: number;
  snapshot_date: string;
  note: string | null;
  created_at: string;
}

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  type: LiabilityType;
  current_balance: number;
  original_amount: number | null;
  interest_rate_pct: number | null;
  end_date: string | null;
  color: string;
  icon: string;
  note: string | null;
  archived_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LiabilitySnapshot {
  id: string;
  user_id: string;
  liability_id: string;
  balance: number;
  snapshot_date: string;
  note: string | null;
  created_at: string;
}

export interface DetectedSubscription {
  id: string;
  user_id: string;
  pattern_key: string;
  display_name: string;
  expected_amount: number;
  amount_stddev_pct: number;
  interval_days: number;
  occurrences: number;
  confidence: number;
  first_seen_date: string;
  last_seen_date: string;
  next_expected_date: string | null;
  dismissed_at: string | null;
  recurring_rule_id: string | null;
  detected_at: string;
  updated_at: string;
}

// Generic row types — keep Insert/Update permissive so actions can pass partials.
// These match the table shape; the actual Postgres types are stricter.
export type AccountInsert = Partial<Account> & {
  user_id: string;
  name: string;
  type: AccountType;
};
export type AccountUpdate = Partial<Account>;

export type CategoryInsert = Partial<Category> & {
  user_id: string;
  name: string;
  type: CategoryType;
};
export type CategoryUpdate = Partial<Category>;

export type ProjectInsert = Partial<Project> & {
  user_id: string;
  name: string;
};
export type ProjectUpdate = Partial<Project>;

export type TransactionInsert = Partial<Transaction> & {
  user_id: string;
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  date: string;
};
export type TransactionUpdate = Partial<Transaction>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      accounts: {
        Row: Account;
        Insert: AccountInsert;
        Update: AccountUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_transfer: {
        Args: {
          p_from_account_id: string;
          p_to_account_id: string;
          p_amount: number;
          p_date: string;
          p_description?: string | null;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
