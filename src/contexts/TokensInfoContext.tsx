import { ABIS, TokenDecimals } from '@/utils';
import React, { createContext, useState, ReactNode, PropsWithChildren, useEffect, Dispatch, SetStateAction } from 'react';
import { useAccount, useChainId, useReadContract } from 'wagmi';

type ContextProps = {
  tokens: Array<Token>|undefined,
  tokensFetchStatus: "error" | "success" | "pending",
  selectedToken: Token|undefined,
  setSelectedToken: Dispatch<SetStateAction<Token|undefined>>
}

export type Token = {
  address: `0x${string}`,
  symbol: keyof TokenDecimals,
  price: bigint,
  maxPurchaseLimit: bigint,
  isActive: boolean
}

const defValues: ContextProps = { tokens: undefined, tokensFetchStatus: 'pending', selectedToken: undefined, setSelectedToken: () => null }

const TokensInfoContext = createContext<ContextProps>(defValues);

const TokensInfoContextProvider = ({ children }: PropsWithChildren) => {

  const { address } = useAccount()
  const chainId = useChainId()

  const [tokens, setTokens] = useState<Array<any>|undefined>(undefined)
  const [selectedToken, setSelectedToken] = useState<Token|undefined>(undefined)

  const { data: tokensArray, status: tokensFetchStatus } = useReadContract({
    address: process.env.NEXT_PUBLIC_PRESALE_ADDRESS as `0x${string}`,
    chainId,
    abi: ABIS.PRESALE,
    functionName: 'getSupportedTokens',
    query: {
      enabled: Boolean(address && chainId),
    },
  })

  function mapToTokens(input: any[]): Token[] {
    const [addresses, symbols, prices, maxPurchaseLimits, actives] = input;
    
    return addresses.map((_: any, i: number) => ({
      address: addresses[i],
      symbol: symbols[i],
      price: prices[i],
      maxPurchaseLimit: maxPurchaseLimits[i],
      isActive: actives[i]
    }));
  }

  useEffect(() => {
    if(Array.isArray(tokensArray)) {
      setTokens(mapToTokens(tokensArray))
    }
  }, [tokensArray])
  
  return <TokensInfoContext value={{
    tokens,
    tokensFetchStatus,
    selectedToken,
    setSelectedToken
  }}>{children}</TokensInfoContext>;
};

export { TokensInfoContext, TokensInfoContextProvider };