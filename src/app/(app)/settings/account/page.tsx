import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { ModeToggle } from "@/components/account/mode-toggle";
import { DeleteAccount } from "@/components/account/delete-account";
import { Mail, Shield, FileText, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/actions/profile";
import { formatDate } from "@/lib/utils/format";

export default async function AccountPage() {
  const supabase = await createClient();
  const [{ data: { user } }, profile] = await Promise.all([
    supabase.auth.getUser(),
    getProfile(),
  ]);

  return (
    <>
      <TopBar title="Akun" subtitle="Profile, mode, privasi" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        {/* Profile */}
        <section className="rounded-2xl border border-border bg-card shadow-soft p-5 space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-12 h-12 rounded-2xl gradient-brand text-white text-xl font-bold">
              {(profile?.display_name || "K")[0].toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{profile?.display_name ?? "Pengguna"}</p>
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1 truncate">
                <Mail className="w-3 h-3" />
                {user?.email ?? "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Mode */}
        <section className="rounded-2xl border border-border bg-card shadow-soft p-5">
          <ModeToggle current={profile?.mode ?? "family"} />
        </section>

        {/* Privacy & data */}
        <section className="rounded-2xl border border-border bg-card shadow-soft p-5 space-y-3">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Privasi & data
          </p>
          {profile?.privacy_accepted_at && (
            <p className="text-[11px] text-muted-foreground">
              Kebijakan privasi disetujui pada {formatDate(profile.privacy_accepted_at)}.
            </p>
          )}
          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/privacy"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors min-h-11"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Kebijakan privasi</p>
                <p className="text-[11px] text-muted-foreground">Data apa yang disimpan & dipakai untuk apa</p>
              </div>
            </Link>
            <Link
              href="/reports"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors min-h-11"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Export data</p>
                <p className="text-[11px] text-muted-foreground">Download seluruh transaksi sebagai CSV</p>
              </div>
            </Link>
          </div>
        </section>

        <DeleteAccount />
      </div>
    </>
  );
}
