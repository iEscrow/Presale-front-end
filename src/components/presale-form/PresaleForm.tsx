'use client'

import CurrencyInput from "./CurrencyInput";
import CurrentBalance from "./CurrencyBalance";
import FormTitle from "./FormTitle";
import GasFee from "./GasFee";
import SupplyStatus from "./SupplyStatus";
import TermsCheckbox from "./TermsCheckbox";
import ESCROWBalance from "./ESCROWBalance";
import WithLines from "./WithLines";
import { TokensInfoContextProvider } from "@/contexts/TokensInfoContext";
import CurrencyList from "./CurrencyList";
import TokensToReceive from "./TokensToReceive";
import SubmitBtn from "./SubmitBtn";

const PresaleForm = () => {

  return (
    <form id="presale-form" className="relative max-w-[720px] py-4 px-4 md:px-6 md:py-8 mb-4 rounded-md border-[1px] border-body-text overflow-hidden">
      <FormTitle/>
      <WithLines>
        <span className="text-base lg:text-md font-semibold text-bg-logo mb-1 rounded-l-full rounded-r-full"> {'1 $ESCROW'} </span>
        <span className="font-bold text-md md:text-lg text-light-blue rounded-l-full rounded-r-full"> $0.015 ESCROW </span>
      </WithLines>
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
        <TokensToReceive/>
        <ESCROWBalance/>
        <SubmitBtn/>
        <TermsCheckbox/>
      </TokensInfoContextProvider>
      <img id="bg-form" src="/img/form-bg-3.png" className="absolute w-full h-full inset-0 -z-50" alt="" />
    </form>
  );
}
 
export default PresaleForm;