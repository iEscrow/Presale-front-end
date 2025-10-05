// hooks/usePresaleSupply.ts
import { useMemo } from "react";
import { formatUnits } from "viem";
import { useChainId, useReadContract } from "wagmi";
import { ABIS, PRESALE_SUPPLY } from "@/utils";

export const usePresaleSupply = () => {
  const chainId = useChainId();

  const { data: remainingTokens, status, queryKey } = useReadContract({
    address: process.env.NEXT_PUBLIC_PRESALE_ADDRESS as `0x${string}`,
    abi: ABIS.PRESALE,
    functionName: 'getRemainingTokens',
    chainId,
    query: {
      enabled: Boolean(chainId),
      refetchInterval: 1000 * 60 * 5,
    }
  });

  const remainingTokensFormatted = remainingTokens 
      ? parseFloat(formatUnits(remainingTokens as bigint, 18))
      : 0;

  const soldTokens = remainingTokens
      ? PRESALE_SUPPLY - parseFloat(formatUnits(remainingTokens as bigint, 18))
      : 0;

  const percentageSold = remainingTokens 
      ? (soldTokens / PRESALE_SUPPLY) * 100
      : 0;

  return {
    remainingTokens: remainingTokensFormatted,
    remainingTokensRaw: remainingTokens as bigint | undefined,
    soldTokens,
    percentageSold,
    status
  };
};