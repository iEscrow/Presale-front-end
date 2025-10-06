import { Address } from '@/globalTypes';
import { ABIS, TokenDecimals } from '@/utils';
import React, { createContext, useState, PropsWithChildren, useEffect, Dispatch, SetStateAction } from 'react';
import { useAccount, useChainId, useReadContract } from 'wagmi';

type ContextProps = {
  address: Address | undefined,
  tokens: Array<Token>|undefined,
  tokensFetchStatus: "error" | "success" | "pending",
  isFetchingTokens: boolean,
  selectedToken: Token|undefined,
  setSelectedToken: Dispatch<SetStateAction<Token|undefined>>,
  currencyQuantity: string,
  setCurrencyQuantity: Dispatch<SetStateAction<string>>,
  termsAccepted: boolean,
  setTermsAccepted: Dispatch<SetStateAction<boolean>>
}

export type Token = {
  address: Address,
  symbol: keyof TokenDecimals,
  price: bigint,
  maxPurchaseLimit: bigint,
  isActive: boolean
}

const defValues: ContextProps = { 
  address: undefined,
  tokens: undefined, 
  tokensFetchStatus: 'pending', 
  isFetchingTokens: true,
  selectedToken: undefined, 
  setSelectedToken: () => null,
  currencyQuantity: '',
  setCurrencyQuantity: () => null,
  termsAccepted: false,
  setTermsAccepted: () => null
}

const TokensInfoContext = createContext<ContextProps>(defValues);

const TokensInfoContextProvider = ({ children }: PropsWithChildren) => {

  const { address } = useAccount()
  const chainId = useChainId()

  const [tokens, setTokens] = useState<Array<any>|undefined>(undefined)
  const [selectedToken, setSelectedToken] = useState<Token|undefined>(undefined)
  const [currencyQuantity, setCurrencyQuantity] = useState<string>('')
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false)

  const { data: tokensArray, status: tokensFetchStatus, isFetching: isFetchingTokens, isEnabled } = useReadContract({
    address: process.env.NEXT_PUBLIC_PRESALE_ADDRESS as Address,
    chainId,
    abi: ABIS.PRESALE,
    functionName: 'getSupportedTokens',
    query: {
      enabled: Boolean(address && chainId),
    },
  })

  // Inicializar termsAccepted desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('termsAccepted');
    if (stored === null) {
      localStorage.setItem('termsAccepted', 'false');
      setTermsAccepted(false);
    } else {
      setTermsAccepted(JSON.parse(stored));
    }
  }, []);

  // Sincronizar termsAccepted con localStorage
  useEffect(() => {
    localStorage.setItem('termsAccepted', JSON.stringify(termsAccepted));
    window.dispatchEvent(new Event('storage'));
  }, [termsAccepted]);

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
  
  return <TokensInfoContext.Provider value={{
    address,
    tokens,
    tokensFetchStatus,
    isFetchingTokens: isFetchingTokens && isEnabled,
    selectedToken,
    setSelectedToken,
    currencyQuantity,
    setCurrencyQuantity,
    termsAccepted,
    setTermsAccepted
  }}>{children}</TokensInfoContext.Provider>;
};

export { TokensInfoContext, TokensInfoContextProvider };