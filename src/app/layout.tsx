import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LegalNoticeBanner } from "@/components/legal/legal-notice-banner";
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
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
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
            <LegalNoticeBanner />
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
