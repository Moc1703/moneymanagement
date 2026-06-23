import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { PrivacyConsent } from "@/components/legal/privacy-consent";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { getProfile } from "@/actions/profile";
import { getAccounts } from "@/actions/accounts";
import { ensureRecurringMaterialized } from "@/actions/recurring";
import { refreshSubscriptionDetection } from "@/actions/subscriptions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();
  const needsOnboarding = profile ? !profile.onboarding_done : false;
  const accounts = needsOnboarding ? await getAccounts() : [];

  // Fire-and-forget: materialize recurring transactions ahead 30 days.
  // Idempotent; failures don't block the page.
  if (!needsOnboarding) {
    try {
      await Promise.all([
        ensureRecurringMaterialized(),
        refreshSubscriptionDetection(),
      ]);
    } catch {
      /* swallow — background work failure shouldn't break navigation */
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 md:pl-64 pb-24 md:pb-0">
        {children}
      </main>
      <BottomNav />
      {needsOnboarding && accounts.length > 0 && <OnboardingWizard accounts={accounts} />}
      {!needsOnboarding && profile && !profile.privacy_accepted_at && <PrivacyConsent />}
      <InstallPrompt />
    </div>
  );
}
