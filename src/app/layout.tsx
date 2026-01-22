import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import HotjarPixel from "@/components/HotjarPixel";

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
  title: "Resistance Mapping Guide™ - Clear Your Fears, Blocks & Patterns",
  description: "The Resistance Mapping™ Expanded 2nd Edition is a System that helps you identify the deeper cause behind your fear & blocks so you can finally clear them, and align with your true self.",
  openGraph: {
    title: "Resistance Mapping Guide™ - Clear Your Fears, Blocks & Patterns",
    description: "A system to help you identify the deeper cause behind your fear & blocks so you can finally clear them.",
    type: "website",
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
        <MetaPixel />
        <HotjarPixel />
        {children}
      </body>
    </html>
  );
}
