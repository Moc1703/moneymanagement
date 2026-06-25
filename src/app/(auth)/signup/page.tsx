import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppLogo } from "@/components/brand/app-logo";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
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
            <h1 className="text-3xl font-extrabold tracking-tight">Buat akun baru</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Mulai kelola keuangan keluarga &amp; usaha
            </p>
          </div>
        </div>
        <SignupForm />
        <p className="text-center text-[11px] text-muted-foreground">
          Dengan daftar lo setuju sama{" "}
          <a href="/privacy" className="text-primary font-semibold hover:underline">
            kebijakan privasi
          </a>
        </p>
      </div>
    </div>
  );
}
