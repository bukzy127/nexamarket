import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import WalletModalProvider from "@/components/WalletModalProvider";
import ThemeProvider from "@/components/ThemeProvider";
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
    "Buy, sell, and own blueprints, BIM models, engineering specs, and construction project files using cryptocurrency. Verified ownership on Injective blockchain. Files stored on IPFS.",
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
    <html
      lang="en"
      className={`${space.variable} ${mono.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("nexamarket:theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){}',
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <WalletModalProvider>
            <Navbar />
            <PageTransition>
              <main>{children}</main>
            </PageTransition>
          </WalletModalProvider>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              backdropFilter: "blur(12px)",
              maxWidth: "min(420px, calc(100vw - 32px))",
              padding: "13px 15px",
              lineHeight: "1.55",
              textAlign: "left",
              overflowWrap: "break-word",
              wordBreak: "normal",
              whiteSpace: "normal",
            },
          }}
        />
      </body>
    </html>
  );
}
