'use client'

import { useAccount, useBalance, useChainId, useReadContract, useToken } from "wagmi";
import CurrencyInput from "./CurrencyInput";
import CurrencyRadio from "./CurrencyRadio";
import CurrentBalance from "./CurrentBalance";
import FormTitle from "./FormTitle";
import GasFee from "./GasFee";
import SupplyStatus from "./SupplyStatus";
import TermsCheckbox from "./TermsCheckbox";
import TokenBalance from "./TokenBalance";
import TokenPrice from "./TokenPrice";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ABIS } from "@/utils";
import { formatUnits } from "viem";

export type Currency = {
  name: string;
  symbol: string;
  iconURL: string;
}

const Currencies: Currency[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    iconURL: "img/currencies/ETH.png"
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    iconURL: "img/currencies/USDC.png"
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    iconURL: "img/currencies/USDT.png"
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    iconURL: "img/currencies/LINK.png"
  },
  {
    name: "Wrapped BNB",
    symbol: "WBNB", 
    iconURL: "img/currencies/WBNB.png"
  },
  {
    name: "Wrapped Ethereum",
    symbol: "WETH",
    iconURL: "img/currencies/WETH.png"
  },
  {
    name: "Wrapped Bitcoin", 
    symbol: "WBTC",
    iconURL: "img/currencies/WBTC.png"
  },
]

const PresaleForm = () => {

  const { address } = useAccount()

  const { data } = useReadContract({
    abi: ABIS.ERC20,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    functionName: 'balanceOf',
    args: [address]
  })

  useEffect(() => {
    console.log(data);
  }, [data])

  return (
    <form id="presale-form" className="relative max-w-[720px] py-4 px-4 md:px-6 md:py-8 mb-4 rounded-md border-[1px] border-body-text overflow-hidden">
      <FormTitle/>
      <TokenPrice title="1 $ESCROW" subtitle="$0.015"/>
      <SupplyStatus presaleSupply={8000000} tokensSold={1923400}/>
      <div className="w-full h-[1px] m:my-8 my-4 bg-body-text rounded-l-full rounded-r-full"></div>
      <div className="">
        <h2 className="text-bg-logo font-semibold text-sm md:text-base">You deposit</h2>
        <div className="md:mb-2 mb-1 mt-2 mx-auto flex items-center justify-center flex-wrap md:gap-2 gap-1">
          {
            Currencies.slice(0,4).map((currency, i) => (
              <CurrencyRadio
                key={i}
                symbol={currency.symbol}
                iconURL={currency.iconURL}
              />
            ))
          }
        </div>
        <div className="mb-3 mx-auto flex items-center justify-center flex-wrap md:gap-2 gap-1">
          <div className="flex-[0.5_1_0]"></div>
          {
            Currencies.slice(4,7).map((currency, i) => (
              <CurrencyRadio
                key={i}
                symbol={currency.symbol}
                iconURL={currency.iconURL}
              />
            ))
          }
          <div className="flex-[0.5_1_0]"></div>
        </div>
        <CurrentBalance
          currentBalance={2.3456}
          currency={{ iconURL: "img/currencies/ETH.png", symbol: "ETH" }}
          />
        <CurrencyInput
          currencyBalance={2.3456}
          currencyIconURL="img/currencies/ETH.png"
          currencySymbol="ETH"
          usdValue={1850}
        />
        <GasFee/>
      </div>
      <TokenPrice title="You will receive" subtitle="166K $ESCROW"/>
      <TokenBalance/>
      <button className="w-full py-3 md:py-4 mt-4 font-medium border-[1px] border-bg-logo text-bg-logo text-sm md:text-base tracking-tight rounded-l-full rounded-r-full cursor-pointer duration-200 hover:text-black hover:border-bg-logo hover:bg-bg-logo" type="submit">Get verified to buy</button>
      <TermsCheckbox/>
      <img id="bg-form" src="/img/form-bg.jpg" className="absolute opacity-15 w-full h-full inset-0 -z-50" alt="" />
    </form>
  );
}
 
export default PresaleForm;