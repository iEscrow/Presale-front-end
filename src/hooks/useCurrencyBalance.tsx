import { use, useMemo } from "react";
import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import { formatUnits } from "viem/utils";
import { TokensInfoContext } from "@/contexts/TokensInfoContext";
import { ABIS, TOKEN_DECIMALS, USD_DECIMALS, TokenDecimals } from "@/utils";
import { Address } from "@/globalTypes";

export const useCurrencyBalance = () => {
  const { selectedToken, currencyQuantity, setCurrencyQuantity } = use(TokensInfoContext);
  const chainId = useChainId();
  const { address: userAddress } = useAccount();

  const { data: tokenBalance, isLoading: isTokenLoading } = useReadContract({
    address: selectedToken?.address as Address,
    abi: ABIS.ERC20,
    chainId,
    functionName: 'balanceOf',
    args: [userAddress],
    query: {
      enabled: !!selectedToken && !!userAddress && selectedToken.symbol !== 'ETH',
    }
  });

  const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({
    address: userAddress,
    chainId,
    query: {
      enabled: !!userAddress && selectedToken?.symbol === 'ETH'
    }
  });

  const getFormattedBalance = () => {
    if (!selectedToken || !userAddress) return null;
    
    const symbol = selectedToken.symbol as keyof TokenDecimals;
    const decimals = TOKEN_DECIMALS[symbol];
    
    if (selectedToken.symbol === 'ETH') {
      if (!nativeBalance?.value) return null;
      return formatUnits(nativeBalance.value, decimals);
    } else {
      if (!tokenBalance) return null;
      return formatUnits(tokenBalance as bigint, decimals);
    }
  };

  const rawBalance = selectedToken?.symbol === 'ETH' 
    ? nativeBalance?.value 
    : tokenBalance as bigint;

  const balanceInUSD = useMemo(() => {
    const balance = getFormattedBalance();
    if (!balance || !selectedToken?.price) return null;
    
    const priceUSD = parseFloat(formatUnits(selectedToken.price, USD_DECIMALS));
    return (parseFloat(balance) * priceUSD);
  }, [selectedToken?.price, tokenBalance, nativeBalance]);

  return {
    formattedBalance: getFormattedBalance(),
    rawBalance,
    balanceInUSD,
    isLoading: selectedToken?.symbol === 'ETH' ? isNativeLoading : isTokenLoading,
    selectedToken,
    userAddress,
    currencyQuantity,
    setCurrencyQuantity
  };
};