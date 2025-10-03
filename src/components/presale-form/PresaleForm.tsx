'use client'

import { useAccount, useAccountEffect, useBalance, useChainId, useReadContract, useToken } from "wagmi";
import CurrencyInput from "./CurrencyInput";
import CurrencyRadio from "./CurrencyRadio";
import CurrentBalance from "./CurrentBalance";
import FormTitle from "./FormTitle";
import GasFee from "./GasFee";
import SupplyStatus from "./SupplyStatus";
import TermsCheckbox from "./TermsCheckbox";
import TokenBalance from "./TokenBalance";
import TokenPrice from "./TokenPrice";
import useNetStatus from "@/hooks/useNetStatus";
import { TokensInfoContextProvider } from "@/contexts/TokensInfoContext";
import CurrencyList from "./CurrencyList";
import { ESCROW_USD_VALUE } from "@/utils";

export type Currency = {
  name: string;
  symbol: string;
  iconURL: string;
  address?: string;
}

const Currencies: Currency[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    iconURL: "img/currencies/ETH.png",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    iconURL: "img/currencies/USDC.png",
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    iconURL: "img/currencies/USDT.png",
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    iconURL: "img/currencies/LINK.png",
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA'
  },
  {
    name: "Wrapped BNB",
    symbol: "WBNB", 
    iconURL: "img/currencies/WBNB.png",
    address: '0x418D75f65a02b3D53B2418FB8E1fe493759c7605'
  },
  {
    name: "Wrapped Ethereum",
    symbol: "WETH",
    iconURL: "img/currencies/WETH.png",
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  {
    name: "Wrapped Bitcoin", 
    symbol: "WBTC",
    iconURL: "img/currencies/WBTC.png",
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  },
]

const PresaleForm = () => {

  const { address, chainId, status } = useNetStatus()

  return (
    <form id="presale-form" className="relative max-w-[720px] py-4 px-4 md:px-6 md:py-8 mb-4 rounded-md border-[1px] border-body-text overflow-hidden">
      <FormTitle/>
      <TokenPrice title={ESCROW_USD_VALUE + ' $ESCROW'} subtitle="$0.015"/>
      <SupplyStatus/>
      <div className="w-full h-[1px] m:my-8 my-4 bg-body-text rounded-l-full rounded-r-full"></div>
      <TokensInfoContextProvider>
        <div className="">
          <h2 className="text-bg-logo font-semibold text-sm md:text-base">You deposit</h2>
          <CurrencyList/>
          <CurrentBalance/>
          <CurrencyInput/>
          <GasFee/>
        </div>
        <TokenPrice title="You will receive" subtitle="166K $ESCROW"/>
        <TokenBalance/>
        <button className="w-full py-3 md:py-4 mt-4 font-medium border-[1px] border-bg-logo text-bg-logo text-sm md:text-base tracking-tight rounded-l-full rounded-r-full cursor-pointer duration-200 hover:text-black hover:border-bg-logo hover:bg-bg-logo" type="submit">Get verified to buy</button>
        <TermsCheckbox/>
      </TokensInfoContextProvider>
      <img id="bg-form" src="/img/form-bg.jpg" className="absolute opacity-15 w-full h-full inset-0 -z-50" alt="" />
    </form>
  );
}
 
export default PresaleForm;