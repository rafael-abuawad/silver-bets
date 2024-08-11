"use client";

import { WagmiProvider, createConfig } from "wagmi";
import { avalanche } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    // Next JS
    ssr: true,

    // Your dApps chains
    chains: [avalanche],

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    // Required App Info
    appName: "Silver Bets",

    // Optional App Info
    appDescription:
      "Una plataforma de apuestas descentralizadas en las que cada apuesta es representado por un NFT con valores dinámicos completamente on-chain. Construido para la hackathon de Ethereum Bolivia 2024.",
    appUrl: "https://github.com/rafael-abuawad/silver-bets", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

const queryClient = new QueryClient();

interface Web3ProviderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider options={{ language: "es-ES" }}>
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
