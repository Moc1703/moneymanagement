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
  created_at: string;
  updated_at: string;
}

export interface TransactionWithRelations extends Transaction {
  account: Account | null;
  project: Project | null;
  category: Category | null;
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
