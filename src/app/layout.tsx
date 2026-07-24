import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LegalNoticeBanner } from "@/components/legal/legal-notice-banner";
import { AuthRecoveryListener } from "@/components/auth/auth-recovery-listener";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL &&
      !/localhost|127\.0\.0\.1/.test(process.env.NEXT_PUBLIC_APP_URL)
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"
  ),
  title: {
    default: "Patron Beni Kap — İşi değil, iş seni bulsun",
    template: "%s | Patron Beni Kap",
  },
  description:
    "Kendini tanıt. Profilini oluştur. Firmalar seni bulsun. Modern ve basit işçi-firma buluşma platformu.",
  keywords: [
    "işçi ara",
    "iş bul",
    "profil oluştur",
    "firma",
    "Patron Beni Kap",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Patron Beni Kap",
    title: "Patron Beni Kap — İşi değil, iş seni bulsun",
    description:
      "Kendini tanıt. Profilini oluştur. Firmalar seni bulsun.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Patron Beni Kap",
    description: "İşi değil, iş seni bulsun.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "300x300", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${outfit.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <AuthRecoveryListener />
            <LegalNoticeBanner />
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
