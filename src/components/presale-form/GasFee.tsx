'use client'

import { useContext, useMemo } from 'react'
import { TokensInfoContext } from '@/contexts/TokensInfoContext'
import { useAccount, useEstimateGas, useGasPrice } from 'wagmi'
import { parseUnits, encodeFunctionData, formatUnits } from 'viem'
import { ABIS, TOKEN_DECIMALS, TokenDecimals } from '@/utils/utils'
import { Address } from '@/globalTypes'
import { useCurrencyBalance } from '@/hooks/useCurrencyBalance'

const GasFee = () => {
  const { selectedToken, currencyQuantity } = useContext(TokensInfoContext)
  const { maxPossibleValue } = useCurrencyBalance()
  const { address } = useAccount()

  const { data: gasPrice } = useGasPrice()

  const PRESALE_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS as Address
  const DUMMY_ADDRESS = '0x0000000000000000000000000000000000000001' as Address

  // ✅ Preparamos los datos de la transacción según el token seleccionado
  const txData = useMemo(() => {
    if (!selectedToken || !currencyQuantity || currencyQuantity === '0' || currencyQuantity === '') return undefined

    try {
      const userAddress = address || DUMMY_ADDRESS
      const decimals = TOKEN_DECIMALS[selectedToken.symbol as keyof TokenDecimals]

      if (selectedToken.symbol === 'ETH') {
        // Compra con ETH nativo
        return {
          to: PRESALE_ADDRESS,
          account: userAddress,
          data: encodeFunctionData({
            abi: ABIS.PRESALE,
            functionName: 'buyWithNative',
            args: [userAddress],
          }),
          value: parseUnits(currencyQuantity, decimals),
        }
      } else {
        // Compra con token ERC20
        return {
          to: PRESALE_ADDRESS,
          account: userAddress,
          data: encodeFunctionData({
            abi: ABIS.PRESALE,
            functionName: 'buyWithToken',
            args: [
              selectedToken.address,
              parseUnits(currencyQuantity, decimals),
              userAddress,
            ],
          }),
        }
      }
    } catch (error) {
      console.error('❌ Error preparing tx for gas estimation:', error)
      return undefined
    }
  }, [selectedToken, currencyQuantity, address])

  // ✅ Estimamos el gas (solo si hay tx válida)
  const { data: gasEstimate, error: gasError, isFetching } = useEstimateGas({
    ...txData,
    query: {
      enabled: 
        !!txData && 
        Boolean(currencyQuantity) &&
        Boolean(maxPossibleValue) &&
        parseFloat(currencyQuantity) <= parseFloat(maxPossibleValue),
      retry: false,
    },
  })

  if (gasError) console.error('⛽ Gas estimation error:', gasError)

  // ✅ Calculamos el costo en ETH
  const gasCostInEth =
    gasEstimate && gasPrice
      ? formatUnits(gasEstimate * gasPrice, 18)
      : null

  return (
    <div className="w-full flex items-center justify-start flex-nowrap text-bg-logo">
      <img className="size-4 md:size-5 text-bg-logo" src="img/gas-fee.svg" alt="Gas pump" />
      <span>
        &nbsp; 
        {isFetching
          ? 'Estimating...'
          : gasCostInEth
          ? `${parseFloat(gasCostInEth).toFixed(6)} ETH`
          : '-'}
      </span>
    </div>
  )
}

export default GasFee
