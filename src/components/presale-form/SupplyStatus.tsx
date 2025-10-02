'use client'

import { ABIS } from "@/utils";
import { useEffect, useMemo } from "react";
import { formatUnits } from "viem";
import { useChainId, useReadContract, useReadContracts } from "wagmi";


const SupplyStatus = () => {

  const chainId = useChainId()

  const presaleSupply = 5_000_000_000

  const { data: remainingTokens, status } = useReadContract(
    {
      address: process.env.NEXT_PUBLIC_PRESALE_ADDRESS as `0x${string}`,
      abi: ABIS.PRESALE,
      functionName: 'getRemainingTokens',
      chainId,
      query: {
        enabled: Boolean(chainId),
        refetchInterval: 1000 * 60 * 5
      }
    },
  )

  const percentajeSold = useMemo(() => {
    return remainingTokens ? Math.floor(((presaleSupply - parseInt(formatUnits(remainingTokens as bigint, 18))) / presaleSupply) * 100) : 0;
  }, [remainingTokens]);

  function formatQuantity(num: number) {
    if (num >= 1_000_000_000_000) {
      return (num / 1_000_000_000_000).toFixed(2) + 'T';
    } else if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + 'B';
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M';
    } else {
      return num.toString();
    }
  }

  return (
    <div>
      <div className="w-full flex items-center justify-between flex-nowrap tracking-tighter !text-sm">
        <span className="text-bg-logo font-medium">
          {remainingTokens
            ? `${formatQuantity(presaleSupply - parseInt(formatUnits(remainingTokens as bigint, 18)))} Tokens sold`
            : '---'}
        </span>
        <span className="text-bg-logo">
          {remainingTokens
            ? `${formatQuantity(parseInt(formatUnits(remainingTokens as bigint, 18)))} Tokens remaining`
            : '---'}
        </span>
      </div>
      <div className="relative w-full my-2 p-1 rounded-l-full rounded-r-full border-body-text border-[1px] ">
        <div
          style={{ width: `${percentajeSold}%` }}
          className="h-2 rounded-l-full rounded-r-full bg-gradient-to-r from-logo-grad-green from-0% via-logo-grad-blue via-30% to-logo-grad-purple to-80%"
        ></div>
      </div>
      <div className="w-full text-right text-sm font-medium text-bg-logo">
        Total sale volume: 5.00B
      </div>
    </div>
  );

}

export default SupplyStatus;