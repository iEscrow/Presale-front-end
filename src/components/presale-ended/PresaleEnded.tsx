import { ABIS, ESCROW_USD_VALUE, USD_DECIMALS } from "@/utils";
import FormTitle from "../presale-form/FormTitle";
import useNetStatus from "@/hooks/useNetStatus";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem/utils";
import { Address } from "@/globalTypes";
import CurrenciesPlaceholder from "../presale-form/CurrenciesPlaceholder";
import ClaimBtn from "./ClaimBtn";
import WithLines from "../presale-form/WithLines";
import PuffLoader from "react-spinners/PuffLoader";
import { useWindowSize } from "@uidotdev/usehooks";

const PresaleEnded = () => {

  const { status: netStatus, address: userAddress, chainId } = useNetStatus()
  const { width } = useWindowSize()

  const { data: usdValue, isLoading: isUsdValueFetching } = useReadContract({
    chainId,
    address: process.env.NEXT_PUBLIC_PRESALE_ADDRESS as Address,
    abi: ABIS.PRESALE,
    functionName: 'getUserTotalUSDValue',
    args: [userAddress],
    query: {
      enabled: userAddress !== undefined && netStatus === 'connected'
    }
  })

  const getReservedESCROW = (usd: bigint) => (parseFloat(formatUnits(usd, USD_DECIMALS)) / ESCROW_USD_VALUE).toFixed(4)

  return (
    <form className="relative max-w-[720px] min-w-[500px] flex flex-col items-center py-4 px-4 md:px-6 md:py-8 mb-4 rounded-md border-[1px] border-body-text bg-linear-245 from-black/70 from-50% to-logo-grad-blue/30 overflow-hidden z-10">
      <FormTitle title="Buy $ESCROW Token" />
      <p className="text-bg-logo font-light text-xs md:text-sm tracking-tight text-center mt-4">
        The <b>$ESCROW</b> presale has ended! You can connect your wallet and claim your tokens now. <br />
        If you weren't able to reserve tokens during the presale, you can check our website to see if another round is on the way.
      </p>
      {
        netStatus === 'loading' ? (
          <div className="relative min-h-[200px] w-full">
            <CurrenciesPlaceholder text="Getting session...">
              <PuffLoader
                color="#FFF"
                size={(width || 1000) >= 768 ? 50 : 40}
                className="mb-2"
              />
            </CurrenciesPlaceholder>
          </div>
        ) : netStatus === 'disconnected' ? (
          <div className="relative min-h-[150px] md:min-h-[200px] w-full">
            <CurrenciesPlaceholder text="Connect your wallet to claim your $ESCROW tokens!">
              <img
                src="/img/wallet.png"
                alt="Wallet icon"
                className="size-10 md:size-12 mb-2"
              />
            </CurrenciesPlaceholder>
          </div>
        ) : <></>
      }
      <WithLines containerClass="mt-0 md:mt-0">
        <span className="text-base lg:text-md font-semibold text-bg-logo mb-1 rounded-l-full rounded-r-full"> You will receive:</span>
        <span className="font-bold text-md md:text-lg text-light-blue rounded-l-full rounded-r-full">
          {
            netStatus === 'disconnected' || netStatus === 'loading' || isUsdValueFetching || typeof usdValue !== 'bigint'
              ? '0 $ESCROW'
              : (getReservedESCROW(usdValue as bigint)) + ' $ESCROW'
          }
        </span>
      </WithLines>
      <ClaimBtn
        text="Claim"
        canClaim={!isUsdValueFetching && usdValue !== undefined && parseInt(getReservedESCROW(usdValue as bigint)) > 0}
      />
    </form>
  );
}

export default PresaleEnded;