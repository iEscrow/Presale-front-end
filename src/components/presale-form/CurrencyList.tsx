import { Token, TokensInfoContext } from "@/contexts/TokensInfoContext";
import { use } from "react";
import { PuffLoader } from "react-spinners";
import CurrencyRadio from "./CurrencyRadio";

const CurrencyList = () => {

  const { tokens, tokensFetchStatus } = use(TokensInfoContext)

  return (
    <>
      {
        tokensFetchStatus === 'pending' && !Boolean(tokens) && !Array.isArray(tokens) ?
          <div className="w-full flex flex-col items-center justify-center my-6">
            <span className="font-poppins text-sm md:text-base tracking-tight font-light mb-2 md:mb-4 text-bg-logo/70">Loading tokens...</span>
            <PuffLoader
              size={30}
              color="#EAE9E9"
            />
          </div> : Array.isArray(tokens) && tokensFetchStatus === 'success' ?
            (
              <div className="animate-appear">
                <div className="md:mb-2 mb-1 mt-2 mx-auto flex items-center justify-center flex-wrap md:gap-2 gap-1">
                  {
                    tokens.slice(0, 4).map((token, i) => (
                      <CurrencyRadio
                        key={i}
                        token={token}
                        iconURL={`/img/currencies/${token.symbol}.png`}
                      />
                    ))
                  }
                </div>
                <div className="mb-3 mx-auto flex items-center justify-center flex-wrap md:gap-2 gap-1">
                  <div className="flex-[0.5_1_0]"></div>
                  {
                    tokens.slice(4, 7).map((token, i) => (
                      <CurrencyRadio
                        key={i}
                        token={token}
                        iconURL={`/img/currencies/${token.symbol}.png`}
                      />
                    ))
                  }
                  <div className="flex-[0.5_1_0]"></div>
                </div>
              </div>) : <></>
      }
    </>
  );
}

export default CurrencyList;