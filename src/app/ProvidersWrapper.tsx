'use client';

import { connectorsForWallets, darkTheme, getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet, phantomWallet, trustWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { defineChain } from "viem/chains/utils";
import { WagmiProvider, createConfig, http, useAccountEffect, useDisconnect } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { GetSiweMessageOptions, RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { SessionProvider, signOut } from 'next-auth/react';
import { HttpTransport } from "viem";
import { GenericIndexable } from "@/globalTypes";
import { PresaleStatusProvider } from "@/contexts/PresaleStatusContext";
import SumsubWebSdk from '@sumsub/websdk-react'

export const hardhat = defineChain({
  id: 31337,
  name: 'Hardhat',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
})

let transports: GenericIndexable<HttpTransport<undefined, false>> = {
  [mainnet.id]: http(),
}

if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
  transports[hardhat.id] = http()
}

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [walletConnectWallet, metaMaskWallet, trustWallet, phantomWallet],
    },
  ],
  {
    appName: 'My RainbowKit App',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  }
);

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

export const config = createConfig({
  ...getDefaultConfig({
    appName: 'My RainbowKit App',
    chains: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' ? [mainnet, hardhat] : [mainnet],
    projectId: 'YOUR_PROJECT_ID',
  }),
  transports: transports as any,
  connectors
});

function DisconnectHandler() {

  const queryClient = useQueryClient()

  useAccountEffect({
    onDisconnect: async () => {
      await signOut({ redirect: false });
      queryClient.clear()
      window.location.reload()
    }
  });

  return null;
}

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: 'Sign this message to confirm wallet ownership and participate in the $ESCROW presale',
});


const ProvidersWrapper = ({ children }: PropsWithChildren) => {

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <SessionProvider refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitSiweNextAuthProvider getSiweMessageOptions={getSiweMessageOptions}>
            <RainbowKitProvider theme={darkTheme()} modalSize="compact">
              <DisconnectHandler />
              <PresaleStatusProvider>
                {children}
              </PresaleStatusProvider>
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}

export default ProvidersWrapper;