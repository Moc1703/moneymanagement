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
