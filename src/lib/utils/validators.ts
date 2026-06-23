import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  account_id: z.string().uuid("Pilih rekening"),
  category_id: z.string().uuid("Pilih kategori"),
  project_id: z.string().uuid().nullable().optional(),
  date: z.string().min(1, "Pilih tanggal"),
  description: z.string().max(200).optional().or(z.literal("")),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const transferSchema = z.object({
  from_account_id: z.string().uuid("Pilih rekening asal"),
  to_account_id: z.string().uuid("Pilih rekening tujuan"),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  date: z.string().min(1, "Pilih tanggal"),
  description: z.string().max(200).optional().or(z.literal("")),
}).refine((data) => data.from_account_id !== data.to_account_id, {
  message: "Rekening asal dan tujuan tidak boleh sama",
  path: ["to_account_id"],
});

export type TransferInput = z.infer<typeof transferSchema>;

export const accountSchema = z.object({
  name: z.string().min(1, "Nama rekening wajib diisi").max(50),
  type: z.enum(["personal", "business"]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna tidak valid"),
  icon: z.string().min(1).max(4),
  initial_balance: z.coerce.number().default(0),
});

export type AccountInput = z.infer<typeof accountSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(50),
  type: z.enum(["income", "expense", "both"]),
  icon: z.string().min(1).max(4),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna tidak valid"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const projectSchema = z.object({
  name: z.string().min(1, "Nama project wajib diisi").max(50),
  description: z.string().max(200).optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna tidak valid"),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const signInSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
});

export type SignUpInput = z.infer<typeof signUpSchema>;

// -- Phase 2 -----------------------------------------------------------------

export const budgetSchema = z.object({
  category_id: z.string().uuid("Pilih kategori"),
  period_month: z.string().regex(/^\d{4}-\d{2}-01$/, "Format bulan tidak valid"),
  amount: z.coerce.number().nonnegative("Nominal tidak boleh negatif"),
  rollover: z.coerce.boolean().optional().default(false),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

export const goalSchema = z.object({
  name: z.string().min(1, "Nama goal wajib diisi").max(60),
  target_amount: z.coerce.number().positive("Target harus lebih dari 0"),
  target_date: z.string().optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna tidak valid"),
  icon: z.string().min(1).max(4),
});
export type GoalInput = z.infer<typeof goalSchema>;

export const goalContributionSchema = z.object({
  goal_id: z.string().uuid(),
  amount: z.coerce.number().refine((n) => n !== 0, "Nominal tidak boleh 0"),
  contribution_date: z.string().min(1, "Pilih tanggal"),
  note: z.string().max(200).optional().or(z.literal("")),
});
export type GoalContributionInput = z.infer<typeof goalContributionSchema>;

export const recurringRuleSchema = z.object({
  account_id: z.string().uuid("Pilih rekening"),
  category_id: z.string().uuid("Pilih kategori"),
  project_id: z.string().uuid().nullable().optional(),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  description: z.string().max(200).optional().or(z.literal("")),
  frequency: z.enum(["weekly", "biweekly", "monthly", "yearly"]),
  day_of_week: z.coerce.number().int().min(0).max(6).nullable().optional(),
  day_of_month: z.coerce.number().int().min(1).max(31).nullable().optional(),
  start_date: z.string().min(1, "Pilih tanggal mulai"),
  end_date: z.string().nullable().optional(),
});
export type RecurringRuleInput = z.infer<typeof recurringRuleSchema>;

export const debtSchema = z.object({
  counterparty: z.string().min(1, "Nama wajib diisi").max(80),
  direction: z.enum(["owe", "lent"]),
  principal: z.coerce.number().positive("Nominal harus lebih dari 0"),
  due_date: z.string().nullable().optional(),
  note: z.string().max(200).optional().or(z.literal("")),
});
export type DebtInput = z.infer<typeof debtSchema>;

export const debtPaymentSchema = z.object({
  debt_id: z.string().uuid(),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  payment_date: z.string().min(1, "Pilih tanggal"),
  note: z.string().max(200).optional().or(z.literal("")),
});
export type DebtPaymentInput = z.infer<typeof debtPaymentSchema>;

export const assetSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(80),
  type: z.enum(["savings", "investment", "gold", "property", "vehicle", "crypto", "other"]),
  current_value: z.coerce.number().nonnegative("Nilai tidak boleh negatif"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna tidak valid"),
  icon: z.string().min(1).max(4),
  note: z.string().max(200).optional().or(z.literal("")),
});
export type AssetInput = z.infer<typeof assetSchema>;

export const liabilitySchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(80),
  type: z.enum(["credit_card", "mortgage", "loan", "paylater", "other"]),
  current_balance: z.coerce.number().nonnegative("Saldo tidak boleh negatif"),
  original_amount: z.coerce.number().optional().nullable(),
  interest_rate_pct: z.coerce.number().optional().nullable(),
  end_date: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna tidak valid"),
  icon: z.string().min(1).max(4),
  note: z.string().max(200).optional().or(z.literal("")),
});
export type LiabilityInput = z.infer<typeof liabilitySchema>;
