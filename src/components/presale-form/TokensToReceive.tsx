import { TokensInfoContext } from "@/contexts/TokensInfoContext"
import { useCurrencyBalance } from "@/hooks/useCurrencyBalance"
import { ESCROW_USD_VALUE, USD_DECIMALS } from "@/utils"
import { use } from "react"
import { formatUnits } from "viem/utils"
import WithLines from "./WithLines"

const TokensToReceive = () => {

  const { selectedToken } = useCurrencyBalance()
  const { currencyQuantity } = use(TokensInfoContext)

  const getESCROWQuantity = () => {
    if (selectedToken === undefined || Number.isNaN(parseInt(currencyQuantity))) return '0'
    const tokenUSDPrice = parseFloat(formatUnits(selectedToken.price, USD_DECIMALS))
    const tokenQuantity = parseFloat(currencyQuantity)
    return ((tokenQuantity * tokenUSDPrice) / ESCROW_USD_VALUE).toFixed(4)
  }

  return (
    <WithLines>
      <span className="text-base lg:text-md font-semibold text-bg-logo mb-1 rounded-l-full rounded-r-full">You will receive</span>
      <span className="font-bold text-md md:text-lg text-light-blue rounded-l-full rounded-r-full"> {getESCROWQuantity()} $ESCROW </span>
    </WithLines>
  );
}

export default TokensToReceive;