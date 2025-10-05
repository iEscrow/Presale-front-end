import { TokensInfoContext } from "@/contexts/TokensInfoContext";
import { use } from "react";
import CurrencyRadio from "./CurrencyRadio";
import { PLACEHOLDER_TOKENS } from "@/utils";
import CurrenciesPlaceholder from "./CurrenciesPlaceholder";
import { Triangle } from "react-loader-spinner";
import useNetStatus from "@/hooks/useNetStatus";

const CurrencyList = () => {

  const { address, tokens, tokensFetchStatus, isFetchingTokens } = use(TokensInfoContext)
  const { status: netStatus } = useNetStatus()

  const getTokens = () => {
    if (!address || tokensFetchStatus !== 'success' || !Array.isArray(tokens)) return PLACEHOLDER_TOKENS
    return tokens
  }

  const isDisconnected = () => !address
  const isFetching = () => tokensFetchStatus === 'pending'

  return (
    <div className="relative animate-appear">
      <div
        className="md:mb-2 mb-1 mt-2 mx-auto flex items-center justify-center flex-wrap md:gap-2 gap-1"
        style={{ visibility: isFetchingTokens || isDisconnected() ? 'hidden' : 'visible' }}
      >
        {
          getTokens().slice(0, 4).map((token, i) => (
            <CurrencyRadio
              key={i}
              token={token}
              iconURL={`/img/currencies/${token.symbol}.png`}
            />
          ))
        }
      </div>
      <div
        className="mb-3 mx-auto flex items-center justify-center flex-wrap md:gap-2 gap-1"
        style={{ visibility: isFetchingTokens || isDisconnected() ? 'hidden' : 'visible' }}
      >
        <div className="flex-[0.5_1_0]"></div>
        {
          getTokens().slice(4, 7).map((token, i) => (
            <CurrencyRadio
              key={i}
              token={token}
              iconURL={`/img/currencies/${token.symbol}.png`}
            />
          ))
        }
        <div className="flex-[0.5_1_0]"></div>
      </div>
      {
        isFetchingTokens || isDisconnected() && <>
          {
            netStatus === 'disconnected' ?
              <CurrenciesPlaceholder text={"Connect your wallet to access the token list"} >
                <img
                  src="/img/wallet.png"
                  alt="Wallet icon"
                  className="size-8 md:size-10 mb-2"
                />
              </CurrenciesPlaceholder>
              :
              isFetching() ?
                <CurrenciesPlaceholder text="Loading tokens...">
                  <Triangle
                    color="#FFF"
                    height={50}
                    width={50}
                    wrapperClass="mb-2"
                    ariaLabel="Loading token list"
                  />
                </CurrenciesPlaceholder> : <></>
          }
        </>
      }
    </div>
  );
}

export default CurrencyList;

/**
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
              <div className="relative animate-appear">
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
 */