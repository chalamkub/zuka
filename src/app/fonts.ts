import { Google_Sans_Flex, Noto_Sans_Thai } from "next/font/google";
import localFont from "next/font/local";

// อังกฤษ / ตัวเลข
export const googleSans = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans",
  display: "swap",
});

// ไทย (fallback)
export const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-noto-thai",
  display: "swap",
});

// ไทย (หลัก) — LINE Seed Sans TH
export const lineSeedTH = localFont({
  variable: "--font-line-seed-th",
  display: "swap",
  src: [
    { path: "./fonts/LINESeedSansTH_W_Th.woff2", weight: "100", style: "normal" },
    { path: "./fonts/LINESeedSansTH_W_Rg.woff2", weight: "400", style: "normal" },
    { path: "./fonts/LINESeedSansTH_W_Bd.woff2", weight: "700", style: "normal" },
    { path: "./fonts/LINESeedSansTH_W_XBd.woff2", weight: "800", style: "normal" },
    { path: "./fonts/LINESeedSansTH_W_He.woff2", weight: "900", style: "normal" },
  ],
});
