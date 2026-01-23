import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import HotjarPixel from "@/components/HotjarPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";

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

export const metadata: Metadata = {
  title: {
    default: "Inner Wealth Initiate - Transform Your Inner World",
    template: "%s | Inner Wealth Initiate",
  },
  description: "Clear the fears, blocks, and patterns that keep you stuck. Discover tools for spiritual awakening and align with your true self.",
  openGraph: {
    siteName: "Inner Wealth Initiate",
    title: "Inner Wealth Initiate - Transform Your Inner World",
    description: "Clear the fears, blocks, and patterns that keep you stuck. Discover tools for spiritual awakening and align with your true self.",
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
