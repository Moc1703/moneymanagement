"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form
      action={onSubmit}
      className="bg-card space-y-4 p-6 rounded-3xl border border-border shadow-soft"
    >
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
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="text-sm text-rose-600 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
          {error}
        </div>
      )}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
        size="lg"
      >
        {isPending ? "Memproses..." : "Masuk"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Daftar
        </Link>
      </p>
    </form>
  );
}
