import { Token, TokensInfoContext } from "@/contexts/TokensInfoContext";
import { Currency } from "./PresaleForm";
import { use } from "react";

type Props = {
  iconURL:string,
  token: Token
}

const CurencyRadio = ({ token, iconURL }: Props) => {

  const { setSelectedToken, selectedToken } = use(TokensInfoContext)

  return (
    <label 
      className="flex-[1_1_0] inline-flex items-center justify-center px-2 py-2 sm:py-3 md:px-12 md:py-4 rounded-lg border-[1px] border-bg-logo cursor-pointer hover:bg-bg-logo hover:border-bg-logo has-[:checked]:bg-bg-logo has-[:checked]:border-bg-logo duration-200 group" 
    >
      <input 
        className="hidden peer" 
        type="radio" 
        value={token.symbol} 
        name="currency" 
        checked={token.symbol === selectedToken?.symbol} 
        onChange={() => setSelectedToken(token)}
      />
      <img className={`size-5 ${token.symbol === 'ETH' && 'border-[1px] border-body-text rounded-full'}`} src={iconURL} alt={token.symbol + ' logo'} />
      <span className="text-bg-logo font-light text-[12px] sm:text-sm ml-1 tracking-tighter group-hover:text-black peer-checked:text-black">{token.symbol}</span>
    </label>
  );
}
 
export default CurencyRadio;