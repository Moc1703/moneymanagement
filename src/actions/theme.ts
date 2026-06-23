"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type Theme = "light" | "dark" | "system";

const COOKIE_NAME = "mm-theme";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setTheme(theme: Theme): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, theme, {
    maxAge: ONE_YEAR,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath("/", "layout");
}

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (value === "dark" || value === "light" || value === "system") return value;
  return "system";
}
