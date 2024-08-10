import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/components/web3-provider";
import "./globals.css";
import AnnouncementBanner from "@/components/announcement-banner";
import Navbar from "@/components/navbar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Silver Bets",
  description:
    "Una plataforma de apuestas descentralizadas en las que cada apuesta es representado por un NFT con valores dinámicos completamente on-chain. Construido para la hackathon de Ethereum Bolivia 2024.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("min-h-screen font-sans antialiased", fontSans.variable)}
      >
        <Web3Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnnouncementBanner />
            <Navbar />
            {children}
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
