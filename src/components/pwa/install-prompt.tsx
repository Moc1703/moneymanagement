"use client";

import { useEffect, useState } from "react";
import { X, Share, Download } from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "mm-pwa-dismissed-at";
const DISMISS_DAYS = 14;

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosVisible, setIosVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed (PWA mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Respect previous dismissal
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const ageDays = (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);
      if (ageDays < DISMISS_DAYS) return;
    }

    // Android / Chrome path — beforeinstallprompt
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);

    // iOS path — manual instructions (no API)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
    if (isIos && isSafari) {
      // Delay a bit so it doesn't pop up immediately
      const t = window.setTimeout(() => setIosVisible(true), 4000);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDeferred(null);
    setIosVisible(false);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  if (installed) return null;
  if (!deferred && !iosVisible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-sm z-[55] animate-in slide-in-from-bottom-3">
      <div className="rounded-2xl bg-card border border-border shadow-soft-lg p-3 flex items-start gap-3">
        <AppLogo size={40} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install Money Management</p>
          {deferred ? (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Akses cepat dari home screen, kerasa kayak native app.
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              Tap <Share className="w-3 h-3 inline" /> lalu &quot;Add to Home Screen&quot;
            </p>
          )}
          {deferred && (
            <button
              type="button"
              onClick={install}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="w-3 h-3" />
              Install sekarang
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
