import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import HotjarPixel from "@/components/HotjarPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { brand, meta } from "@/config/brand";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// [CUSTOMIZE] Update brand name and description in src/config/brand.ts
export const metadata: Metadata = {
  title: {
    default: `${brand.name} - ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: meta.defaultDescription,
  openGraph: {
    siteName: brand.name,
    title: `${brand.name} - ${brand.tagline}`,
    description: meta.defaultDescription,
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <GoogleAnalytics />
        <MetaPixel />
        <HotjarPixel />
        {children}
      </body>
    </html>
  );
}
