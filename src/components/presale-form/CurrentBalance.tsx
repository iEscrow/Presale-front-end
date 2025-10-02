import { TokensInfoContext } from "@/contexts/TokensInfoContext";
import { use, useEffect } from "react";
import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import { ABIS, TOKEN_DECIMALS, TokenDecimals } from "@/utils";
import { formatUnits } from "viem/utils";

const CurrentBalance = () => {

  const { selectedToken } = use(TokensInfoContext)
  const chainId = useChainId()
  const { address: userAddress } = useAccount();

  const { data: tokenBalance } = useReadContract({
    address: selectedToken?.address as `0x${string}`,
    abi: ABIS.ERC20,
    chainId,
    functionName: 'balanceOf',
    args: [userAddress],
    query: {
      enabled: !!selectedToken && !!userAddress && selectedToken.symbol !== 'ETH',
    }
  });

  const { data: nativeBalance } = useBalance({
    address: userAddress,
    chainId,
    query: {
      enabled: !!userAddress && selectedToken?.symbol === 'ETH'
    }
  })

  const getFormattedBalance = () => {
    if (!selectedToken || !userAddress) return '-';
    
    const symbol = selectedToken.symbol as keyof TokenDecimals;
    const decimals = TOKEN_DECIMALS[symbol];
    
    if (selectedToken.symbol === 'ETH') {
      if (!nativeBalance?.value) return '0';
      return formatUnits(nativeBalance.value, decimals);
    } else {
      if (!tokenBalance) return '0';
      return formatUnits(tokenBalance as bigint, decimals);
    }
  };

  const formattedBalance = getFormattedBalance();

  return (
    <div className="w-fit mb-3 flex items-center justify-start bg-body-text px-2 py-1 rounded-l-full rounded-r-full">
      <span className="text-bg-logo font-light text-sm">Current balance: &nbsp;</span>
      <span className="text-bg-logo font-medium text-sm">
        {formattedBalance} {selectedToken?.symbol || ''}
      </span>
      {selectedToken && (
        <img 
          className="size-4 ml-2" 
          src={`/img/currencies/${selectedToken.symbol}.png`} 
          alt={selectedToken.symbol + ' logo'} 
        />
      )}
    </div>
  );
}
 
export default CurrentBalance;