import { useCurrencyBalance } from "@/hooks/useCurrencyBalance";
import useNetStatus from "@/hooks/useNetStatus";

const CurrencyBalance = () => {
  const { formattedBalance, selectedToken } = useCurrencyBalance();
  const { status } = useNetStatus()

  const displayBalance = () => {
    if(status !== 'connected') return '-'
    if(!selectedToken) return 'No token selected.';
    return formattedBalance;
  };

  return (
    <div className="w-fit mb-3 flex items-center justify-start bg-body-text px-2 py-1 rounded-l-full rounded-r-full">
      <span className="text-bg-logo font-light text-sm">Current balance: &nbsp;</span>
      <span className="text-bg-logo font-medium text-sm animate-appear" key={selectedToken?.symbol}>
        {displayBalance()} {selectedToken?.symbol || ''}
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
 
export default CurrencyBalance;