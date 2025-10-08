import { useCurrencyBalance } from "@/hooks/useCurrencyBalance";
import { TOKEN_DECIMALS } from "@/utils";
import { useWindowSize } from "@uidotdev/usehooks";
import { useEffect } from "react";

type Props = {}

const CurrencyInput = ({ }: Props) => {
  const {
    selectedToken,
    formattedBalance,
    balanceInUSD,
    currencyQuantity,
    setCurrencyQuantity,
    maxPossibleValue,
    currencyValueInUSD
  } = useCurrencyBalance();

  const { width, height } = useWindowSize()

  useEffect(() => {
    setCurrencyQuantity('')
  }, [selectedToken])

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
    <>
      <label className="w-full flex items-center justify-center flex-nowrap px-2 py-1 my-2 border-[1px] border-body-text rounded-l-md rounded-r-lg">
        <img
          className="size-6 ml-2 animate-rotate-x-and-y"
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
          <span key={currencyValueInUSD} className="w-full text-[12px] md:text-sm text-bg-logo font-light text-left animate-appear">
            $ {currencyValueInUSD !== null ? currencyValueInUSD.toFixed(4) : '0'}
          </span>
        </div>
        <img
          src={'/img/cancel.svg'} 
          className="size-4 md:size-6 cursor-pointer mr-2"
          onClick={() => setCurrencyQuantity('')} 
          alt="Restart currency input"
        />
        <button
          type="button"
          className="font-medium bg-bg-logo hover:bg-white duration-200 text-black px-3 py-1 md:px-4 md:py-2 rounded-l-md rounded-r-md text-nowrap cursor-pointer box-border disabled:bg-gray disabled:cursor-not-allowed"
          disabled={(
            selectedToken === undefined ||
            formattedBalance === null ||
            balanceInUSD === null
          )}
          onClick={() => setCurrencyQuantity(maxPossibleValue)}>
          {
            width && width >= 768 ? 'Max Amount' : 'Max'
          }
        </button>
      </label>
      <div className="w-full pb-2 text-[10px] md:text-xs text-error leading-1">
        {
          selectedToken ? (
            parseFloat(currencyQuantity) > parseFloat(maxPossibleValue) ? `- Max possible ${selectedToken.symbol} exceeded!` : <div className="text-transparent">xxx</div>

          )
            : <div className="text-transparent">xxx</div>
        }
      </div>
    </>
  );
}

export default CurrencyInput;