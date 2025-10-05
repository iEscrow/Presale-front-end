'use client'

import { TokensInfoContext } from "@/contexts/TokensInfoContext";
import useNetStatus from "@/hooks/useNetStatus";
import { FormEvent, use, useState, useEffect, useMemo } from "react";
import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { parseUnits } from "viem";
import { ABIS, TOKEN_DECIMALS, TokenDecimals } from "@/utils";
import { useConfig } from "wagmi";
import { InvalidateQueryFilters, useQueryClient } from "@tanstack/react-query";

const SubmitBtn = () => {

  const { currencyQuantity, selectedToken, termsAccepted } = use(TokensInfoContext)
  const { status: netStatus, address: userAddress, chainId } = useNetStatus()
  const [btnText, setBtnText] = useState<'Buy' | 'Approve Allowance' | 'Finalizing purchase'>('Buy')
  const [isProcessing, setIsProcessing] = useState(false)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const client = useQueryClient()
  const config = useConfig()

  const PRESALE_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS as `0x${string}`;

  // Fetch allowance cuando cambie el token o usuario
  useEffect(() => {
    if (!selectedToken || !userAddress || selectedToken.symbol === 'ETH') {
      setAllowance(0n)
      return
    }

    const fetchAllowance = async () => {
      try {
        const result = await readContract(config, {
          address: selectedToken.address,
          abi: ABIS.ERC20,
          functionName: 'allowance',
          args: [userAddress, PRESALE_ADDRESS],
          chainId
        })
        setAllowance(result as bigint)
      } catch (error) {
        console.error('Error fetching allowance:', error)
        setAllowance(0n)
      }
    }

    fetchAllowance()
  }, [selectedToken, userAddress, chainId])

  const btnDisabled = useMemo(() => {
    if (isProcessing) return true;
    
    return (
      !termsAccepted ||
      !currencyQuantity ||
      isNaN(parseFloat(currencyQuantity)) ||
      parseFloat(currencyQuantity) <= 0 ||
      netStatus === 'disconnected' ||
      netStatus === 'loading' ||
      !selectedToken
    );
  }, [termsAccepted, currencyQuantity, netStatus, selectedToken, isProcessing]);

  const needsApproval = () => {
    if (!selectedToken || selectedToken.symbol === 'ETH' || !currencyQuantity) return false

    try {
      const decimals = TOKEN_DECIMALS[selectedToken.symbol as keyof TokenDecimals]
      const amountNeeded = parseUnits(currencyQuantity, decimals)
      return allowance < amountNeeded
    } catch {
      return false
    }
  }

  const handleApprove = async () => {
    if (!selectedToken || !userAddress) return

    try {
      setIsProcessing(true)
      setBtnText('Approve Allowance')

      const decimals = TOKEN_DECIMALS[selectedToken.symbol as keyof TokenDecimals]
      const amount = parseUnits(currencyQuantity, decimals)

      const hash = await writeContract(config, {
        address: selectedToken.address,
        abi: ABIS.ERC20,
        functionName: 'approve',
        args: [PRESALE_ADDRESS, amount],
        chainId
      })

      await waitForTransactionReceipt(config, { hash, chainId })

      // Actualizar allowance
      const newAllowance = await readContract(config, {
        address: selectedToken.address,
        abi: ABIS.ERC20,
        functionName: 'allowance',
        args: [userAddress, PRESALE_ADDRESS],
        chainId
      })
      setAllowance(newAllowance as bigint)

      // Proceder con la compra automáticamente
      await executeBuy()

    } catch (error) {
      console.error('Approve error:', error)
      setBtnText('Buy')
      setIsProcessing(false)
    }
  }

  const executeBuy = async () => {
    if (!selectedToken || !userAddress) return

    try {
      setIsProcessing(true)
      setBtnText('Finalizing purchase')

      const decimals = TOKEN_DECIMALS[selectedToken.symbol as keyof TokenDecimals]
      const amount = parseUnits(currencyQuantity, decimals)

      let hash: `0x${string}`

      if (selectedToken.symbol === 'ETH') {
        hash = await writeContract(config, {
          address: PRESALE_ADDRESS,
          abi: ABIS.PRESALE,
          functionName: 'buyWithNative',
          args: [userAddress],
          value: amount,
          chainId
        })
      } else {
        hash = await writeContract(config, {
          address: PRESALE_ADDRESS,
          abi: ABIS.PRESALE,
          functionName: 'buyWithToken',
          args: [selectedToken.address, amount, userAddress],
          chainId
        })
      }

      await waitForTransactionReceipt(config, { hash, chainId })

      // Éxito
      setBtnText('Buy')
      setIsProcessing(false)
      client.refetchQueries(['readContract'] as InvalidateQueryFilters)
      alert('Tokens reserved!')

    } catch (error) {
      console.error('Buy error:', error)
      setBtnText('Buy')
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (btnDisabled) return

    if (needsApproval()) {
      await handleApprove()
    } else {
      await executeBuy()
    }
  }

  return (
    <button
      className="w-full py-3 md:py-4 mt-4 font-medium border-[1px] border-bg-logo text-bg-logo text-sm md:text-base tracking-tight rounded-l-full rounded-r-full cursor-pointer duration-200 hover:text-black hover:border-bg-logo hover:bg-bg-logo disabled:cursor-not-allowed disabled:opacity-70"
      type="submit"
      onClick={handleSubmit}
      disabled={btnDisabled}
    > {btnText} </button>
  );
}

export default SubmitBtn;