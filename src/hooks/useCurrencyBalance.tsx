import { use, useMemo } from "react";
import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import { formatUnits } from "viem/utils";
import { TokensInfoContext } from "@/contexts/TokensInfoContext";
import { ABIS, TOKEN_DECIMALS, USD_DECIMALS, TokenDecimals, ESCROW_USD_VALUE } from "@/utils";
import { Address } from "@/globalTypes";
import { usePresaleSupply } from "@/hooks/usePresaleSupply";

export const useCurrencyBalance = () => {
  const { selectedToken, currencyQuantity, setCurrencyQuantity } = use(TokensInfoContext);
  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const { remainingTokens } = usePresaleSupply();

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

  // Nueva lógica: calcular el máximo valor posible
  const maxPossibleValue = useMemo(() => {
    if (!selectedToken || !getFormattedBalance() || !balanceInUSD) {
      return '0';
    }

    const balance = parseFloat(getFormattedBalance()!);
    const balanceUSD = parseFloat(balanceInUSD.toString());
    const decimals = TOKEN_DECIMALS[selectedToken.symbol];
    const tokenPriceUSD = parseFloat(formatUnits(selectedToken.price, USD_DECIMALS));
    const remainingTokensValueUSD = remainingTokens * ESCROW_USD_VALUE;

    let maxAmount: number;

    if (balanceUSD <= remainingTokensValueUSD) {
      maxAmount = balance;
    } else {
      maxAmount = remainingTokensValueUSD / tokenPriceUSD;
    }
    
    return maxAmount.toFixed(decimals);
  }, [selectedToken, tokenBalance, nativeBalance, balanceInUSD, remainingTokens]);

  // Nueva lógica: valor en USD de la cantidad ingresada
  const currencyValueInUSD = useMemo(() => {
    if (!selectedToken || !currencyQuantity) return null;

    const quantity = parseFloat(currencyQuantity);
    if (isNaN(quantity)) return null;

    return quantity * parseFloat(formatUnits(selectedToken.price, USD_DECIMALS));
  }, [selectedToken, currencyQuantity]);

  return {
    formattedBalance: getFormattedBalance(),
    rawBalance,
    balanceInUSD,
    isLoading: selectedToken?.symbol === 'ETH' ? isNativeLoading : isTokenLoading,
    selectedToken,
    userAddress,
    currencyQuantity,
    setCurrencyQuantity,
    maxPossibleValue,
    currencyValueInUSD
  };
};