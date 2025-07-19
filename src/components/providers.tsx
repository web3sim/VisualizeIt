"use client";

import * as React from "react";
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useWalletClient,
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoryProvider } from "@story-protocol/react-sdk";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createWalletClient, type Chain } from "viem";
import { PropsWithChildren } from "react";
import AppProvider from "@/lib/context/AppContext";
import { zoraSepolia } from "viem/chains";

interface ProvidersProps {
  children: React.ReactNode;
}

export const iliad = {
  id: 1513, // Your custom chain ID
  name: "Story Network Testnet",
  nativeCurrency: {
    name: "Testnet IP",
    symbol: "IP",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://testnet.storyrpc.io"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://testnet.storyscan.xyz" },
  },
  testnet: true,
} as const satisfies Chain;

export const config = createConfig(
  getDefaultConfig({
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: [iliad, zoraSepolia],
    appName: "VisualizeIt.ai",
  })
);

const queryClient = new QueryClient();

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ConnectKitProvider theme="rounded">{children}</ConnectKitProvider>
        </AppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
