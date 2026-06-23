"use client";

import { useEffect } from "react";

// Registers the service worker once on mount. Errors are swallowed —
// PWA features are best-effort and shouldn't block normal navigation.
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none", scope: "/" })
      .catch(() => {
        /* no-op */
      });
  }, []);
  return null;
}
