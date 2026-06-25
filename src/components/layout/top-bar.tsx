import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getTheme } from "@/actions/theme";

export async function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = await getTheme();
  return (
    <header className="sticky top-0 z-40 bg-background/95 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground font-medium -mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <ThemeToggle current={theme} />
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground md:hidden"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
