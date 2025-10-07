import { Address } from "@/globalTypes";
import useNetStatus from "@/hooks/useNetStatus";
import { ABIS, ESCROW_USD_VALUE, USD_DECIMALS } from "@/utils";
import { useEffect } from "react";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";

const ESCROWBalance = () => {

  const { status: netStatus, address: userAddress, chainId } = useNetStatus()

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

  // const { data: escrowBalance, isLoading: iEscrowBalanceLoading } = useReadContract({
  //   address: process.env.NEXT_PUBLIC_UNITY_FINANCE_ADDRESS as `0x${string}`,
  //   abi: ABIS.ERC20,
  //   chainId,
  //   functionName: 'balanceOf',
  //   args: [userAddress],
  //   query: {
  //     enabled: netStatus === 'connected',
  //   }
  // });

  return (
    <div id="escrow-balance" className="w-full py-4 md:py-6 px-3 md:px-4 flex items-center justify-between bg-gray/5 tracking-tight rounded-l-md rounded-r-md">
      <span className="text-bg-logo text-[14px] md:text-sm font-medium">Your reserved $ESCROW</span>
      <span className="text-bg-logo text-[14px] md:text-sm font-medium">
      {
        netStatus === 'disconnected' || netStatus === 'loading' || isUsdValueFetching || typeof usdValue !== 'bigint' 
          ? '-'  
          : (getReservedESCROW(usdValue as bigint)) + ' $ESCROW'
      }
      </span>
    </div>
  );
}

export default ESCROWBalance;