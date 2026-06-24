import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RegisterSW } from "@/components/pwa/register-sw";
import { getTheme } from "@/actions/theme";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Money Management",
  description: "Aplikasi kas keluarga & usaha",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Money Mgmt",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1230",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();
  const themeClass = theme === "dark" ? "dark" : "";
  // For "system", let the client script below decide on initial paint.
  const systemScript =
    theme === "system"
      ? `(function(){try{var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(_){}})();`
      : null;

  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${geistMono.variable} ${themeClass} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {systemScript && (
          <script
            dangerouslySetInnerHTML={{ __html: systemScript }}
          />
        )}
        {children}
        <RegisterSW />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
