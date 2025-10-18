import { TokensInfoContext } from "@/contexts/TokensInfoContext";
import { use } from "react";
import CurrencyRadio from "./CurrencyRadio";
import { PLACEHOLDER_TOKENS } from "@/utils/utils";
import CurrenciesPlaceholder from "./CurrenciesPlaceholder";
import useNetStatus from "@/hooks/useNetStatus";
import { PuffLoader } from "react-spinners";
import { useWindowSize } from "@uidotdev/usehooks";

const CurrencyList = () => {

  const { address, tokens, tokensFetchStatus, isFetchingTokens } = use(TokensInfoContext)
  const { status } = useNetStatus()
  const { width } = useWindowSize()

  const getTokens = () => {
    if (!address || tokensFetchStatus !== 'success' || !Array.isArray(tokens) || status !== 'connected') return PLACEHOLDER_TOKENS
    return tokens
  }

  const shouldShowPlaceholder = !address || isFetchingTokens || status !== 'connected'

  return (
    <div className="relative min-h-[180px] flex items-center justify-center">
      {shouldShowPlaceholder ? (
        <div className="absolute inset-0 flex items-center justify-center animate-appear">
          {!address ? (
            <CurrenciesPlaceholder text="Connect your wallet to access the token list">
              <img
                src="/img/wallet.png"
                alt="Wallet icon"
                className="size-8 md:size-10 mb-2"
              />
            </CurrenciesPlaceholder>
          ) : (
            <CurrenciesPlaceholder text="Loading tokens...">
              <PuffLoader
                color="#FFF"
                size={(width || 1000) >= 768 ? 50 : 40}
                className="mb-2"
              />
            </CurrenciesPlaceholder>
          )}
        </div>
      ) : (
        <div className="w-full animate-appear">
          <div className="md:mb-2 mb-1 mt-2 mx-auto flex items-center justify-center flex-wrap md:gap-2 gap-1">
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
          <div className="mb-3 mx-auto flex items-center justify-center flex-wrap md:gap-2 gap-1">
            <div className="flex-[0.5_1_0] md:flex-[0.7_1_0]"></div>
            {
              getTokens().slice(4, 7).map((token, i) => (
                <CurrencyRadio
                  key={i}
                  token={token}
                  iconURL={`/img/currencies/${token.symbol}.png`}
                />
              ))
            }
            <div className="flex-[0.5_1_0] md:flex-[0.7_1_0]"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencyList;