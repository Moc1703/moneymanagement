import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-brand text-white shadow-soft-lg">
            <Sparkles className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">Money</span> Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola keuangan keluarga & usaha
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-[11px] text-muted-foreground">
          Single shared login · sync semua device
        </p>
      </div>
    </div>
  );
}
