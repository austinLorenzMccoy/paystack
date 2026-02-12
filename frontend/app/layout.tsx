import React from "react"
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";
import { WalletProvider } from "@/contexts/wallet-context";
import { AuthProvider } from "@/contexts/auth-context";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700", "800"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PayStack - Bitcoin Creator Monetization SDK",
  description:
    "The first Bitcoin-native SDK for content monetization. Built on Stacks. Powered by x402. One line of code, Bitcoin-native payments, creator-first monetization.",
  generator: "v0.app",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${jetbrainsMono.variable} ${ibmPlexSans.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <WalletProvider>{children}</WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
