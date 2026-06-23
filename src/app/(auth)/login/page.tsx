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
    <div className="relative flex flex-1 items-center justify-center p-4 sm:p-8 overflow-hidden bg-background">
      <div aria-hidden className="absolute inset-0 mesh-bg-fixed opacity-90" />
      <div
        aria-hidden
        className="absolute -top-32 -left-24 w-96 h-96 rounded-full gradient-brand opacity-40 blur-3xl animate-orb"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full gradient-cyan opacity-30 blur-3xl animate-orb"
        style={{ animationDelay: "-6s" }}
      />

      <div className="relative w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-brand text-white shadow-glow">
            <Sparkles className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">Money</span> Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola keuangan keluarga & usaha dengan cerdas
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
