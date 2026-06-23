"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Monitor } from "lucide-react";
import { setTheme, type Theme } from "@/actions/theme";
import { cn } from "@/lib/utils";

const NEXT: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const LABEL: Record<Theme, string> = {
  light: "Mode terang",
  dark: "Mode gelap",
  system: "Ikut sistem",
};

export function ThemeToggle({ current }: { current: Theme }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = NEXT[current];
    startTransition(async () => {
      await setTheme(next);
      // For instant feel — update html class before server round-trip lands.
      if (typeof document !== "undefined") {
        const cls = document.documentElement.classList;
        if (next === "dark") cls.add("dark");
        else if (next === "light") cls.remove("dark");
        else {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          cls.toggle("dark", prefersDark);
        }
      }
      router.refresh();
    });
  }

  const Icon = current === "dark" ? Moon : current === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex items-center justify-center min-w-11 min-h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
        isPending && "opacity-60",
      )}
      aria-label={`Tema: ${LABEL[current]}`}
      title={LABEL[current]}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
