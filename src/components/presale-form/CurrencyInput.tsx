import { useCurrencyBalance } from "@/hooks/useCurrencyBalance";
import { usePresaleSupply } from "@/hooks/usePresaleSupply";
import { ESCROW_USD_VALUE, TOKEN_DECIMALS } from "@/utils";
import { useEffect, useState } from "react";
import { formatUnits } from "viem/utils";

type Props = {}

const CurrencyInput = ({}: Props) => {
  const { selectedToken, formattedBalance, balanceInUSD, currencyQuantity, setCurrencyQuantity } = useCurrencyBalance();
  const [tokenUSDValue, setTokenUSDValue] = useState<number | null>(null);
  const { remainingTokens } = usePresaleSupply();

  useEffect(() => {
    if (selectedToken && currencyQuantity) {
      const quantity = parseFloat(currencyQuantity);
      if (!isNaN(quantity)) {
        setTokenUSDValue(quantity * parseFloat(formatUnits(selectedToken.price, 8)));
      } else {
        setTokenUSDValue(null);
      }
      return;
    }
    setTokenUSDValue(null);
  }, [selectedToken, currencyQuantity]);

const setMaxPossibleTokens = () => {
  if (selectedToken && formattedBalance && balanceInUSD) {
    const balance = parseFloat(formattedBalance);
    const balanceUSD = parseFloat(balanceInUSD.toString());
    const decimals = TOKEN_DECIMALS[selectedToken.symbol];
    const tokenPriceUSD = parseFloat(formatUnits(selectedToken.price, 8));
    const remainingTokensValueUSD = remainingTokens * ESCROW_USD_VALUE;
    
    let maxAmount: number;
    
    if (balanceUSD <= remainingTokensValueUSD) {
      maxAmount = balance;
    } else {
      maxAmount = remainingTokensValueUSD / tokenPriceUSD;
    }
    
    const formattedAmount = maxAmount.toFixed(decimals);
    setCurrencyQuantity(formattedAmount);
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '') {
      setCurrencyQuantity('');
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    if (selectedToken) {
      const decimals = TOKEN_DECIMALS[selectedToken.symbol];
      const parts = value.split('.');
      
      if (parts[1] && parts[1].length > decimals) {
        setCurrencyQuantity(numValue.toFixed(decimals));
      } else {
        setCurrencyQuantity(value);
      }
    } else {
      setCurrencyQuantity(value);
    }
  };

  return (
    <label className="w-full flex items-center justify-center flex-nowrap px-2 py-1 my-2 border-[1px] border-body-text rounded-l-md rounded-r-lg">
      <img 
        className="size-6 ml-2 animate-rotate-quarter-x" 
        key={selectedToken?.symbol} 
        src={'img/currencies/' + (selectedToken?.symbol || 'not-selected') + '.png'} 
        alt={selectedToken?.symbol + ' logo'}
      />
      <div className="flex w-full mx-4 flex-col items-center justify-start">
        <input 
          className="w-full p-0 m-0 text-sm md:text-base text-bg-logo font-medium placeholder:font-light focus:outline-none"
          type="text"
          inputMode="decimal"
          onChange={handleInputChange} 
          value={currencyQuantity}
          placeholder={'0.0'}
          disabled={!selectedToken}
        />
        <span key={tokenUSDValue} className="w-full text-[12px] md:text-sm text-bg-logo font-light text-left animate-appear">
          $ {tokenUSDValue !== null ? tokenUSDValue.toFixed(4) : '0'}
        </span>
      </div>
      <button 
        type="button" 
        className="font-medium bg-bg-logo hover:bg-white duration-200 text-black px-3 py-1 md:px-4 md:py-2 rounded-l-md rounded-r-md text-nowrap cursor-pointer box-border disabled:bg-gray disabled:cursor-not-allowed" 
        disabled={(selectedToken === undefined || formattedBalance === null || balanceInUSD === null)}
        onClick={setMaxPossibleTokens}>
        Max Amount
      </button>
    </label>
  );
}
 
export default CurrencyInput;