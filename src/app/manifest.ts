import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Money Management",
    short_name: "Money Mgmt",
    description: "Aplikasi kas keluarga & usaha dengan smart insights, kantong, dan goals.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f0a1f",
    theme_color: "#7c3aed",
    orientation: "portrait",
    lang: "id",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
