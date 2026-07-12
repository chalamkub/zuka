import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { googleSans, notoThai, lineSeedTH } from "./fonts";
import { getServerSettings } from "@/lib/settings-server";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { SettingsProvider } from "@/context/settings-context";
import { ToastProvider } from "@/components/admin/toast";
import { AnnouncementPopup } from "@/components/shop/announcement-popup";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const FALLBACK_DESCRIPTION =
  "ร้านค้าออนไลน์สินค้าดิจิทัล ซื้อง่าย รวดเร็ว ปลอดภัย จัดส่งอัตโนมัติ";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getServerSettings();
  const site = settings?.site;
  const meta = settings?.meta;

  const siteName = site?.name ?? "Zuka";
  const title = meta?.title?.trim() || siteName;
  const description =
    meta?.description?.trim() ||
    site?.description?.trim() ||
    FALLBACK_DESCRIPTION;
  const ogImage = meta?.ogImage || site?.logoUrl || undefined;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    title: { default: title, template: `%s · ${siteName}` },
    description,
    applicationName: siteName,
    keywords: meta?.keywords?.length ? meta.keywords : undefined,
    icons: site?.faviconUrl ? { icon: site.faviconUrl } : undefined,
    openGraph: {
      title,
      description,
      siteName,
      type: "website",
      locale: "th_TH",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: site?.maintenance ? { index: false, follow: false } : undefined,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getServerSettings();
  return {
    themeColor: settings?.meta?.themeColor?.trim() || "#111827",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        googleSans.variable,
        lineSeedTH.variable,
        notoThai.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SettingsProvider>
              <ToastProvider>
                <Navbar />
                <div className="flex flex-1 flex-col">{children}</div>
                <Footer />
                <AnnouncementPopup />
              </ToastProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
