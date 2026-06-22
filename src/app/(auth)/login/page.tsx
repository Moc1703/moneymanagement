import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white text-2xl">
            💰
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Money Management</h1>
          <p className="text-sm text-slate-600">
            Masuk untuk kelola keuangan keluarga & usaha
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
