import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppLogo } from "@/components/brand/app-logo";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-sm space-y-7">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AppLogo size={64} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Money<span className="text-primary">.</span>Mgmt
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Kelola keuangan keluarga &amp; usaha
            </p>
          </div>
        </div>
        <LoginForm />
        <p className="text-center text-[11px] text-muted-foreground">
          Single shared login · sync semua device
        </p>
      </div>
    </div>
  );
}
