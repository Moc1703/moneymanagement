"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionResult = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: AuthActionResult, formData: FormData) => signUp(formData),
    initialState
  );

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="kamu@email.com"
          required
          autoComplete="email"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {state.error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {state.error}
        </div>
      )}
      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? "Membuat akun..." : "Daftar"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline-offset-4 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}