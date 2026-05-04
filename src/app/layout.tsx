import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import WalletModalProvider from "@/components/WalletModalProvider";
import "./globals.css";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NexaMarket — Decentralized Construction Asset Marketplace",
  description:
    "Buy, sell, and own blueprints, BIM models, engineering specs, and construction project files using cryptocurrency. Verified ownership on Injective blockchain. Files stored permanently on IPFS.",
  keywords: [
    "Injective",
    "Web3",
    "Construction",
    "Blueprints",
    "BIM",
    "CAD",
    "IPFS",
    "Marketplace",
    "AEC",
  ],
  openGraph: {
    title: "NexaMarket",
    description:
      "Decentralized marketplace for construction assets — secured on Injective.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${space.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <WalletModalProvider>
          <Navbar />
          <PageTransition>
            <main>{children}</main>
          </PageTransition>
        </WalletModalProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(13,22,37,0.95)",
              color: "#e8f0fe",
              border: "1px solid rgba(0,212,255,0.2)",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
