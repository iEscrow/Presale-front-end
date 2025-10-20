'use client'

import { TokensInfoContext } from "@/contexts/TokensInfoContext";
import { useKYC } from "@/contexts/KYCContext";
import useNetStatus from "@/hooks/useNetStatus";
import { FormEvent, use, useState, useEffect, useMemo } from "react";
import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { parseUnits } from "viem";
import { ABIS, TOKEN_DECIMALS, TokenDecimals } from "@/utils/utils";
import { useConfig } from "wagmi";
import { InvalidateQueryFilters, useQueryClient } from "@tanstack/react-query";
import { Address } from "@/globalTypes";
import toast from "react-hot-toast";
import { useCurrencyBalance } from "@/hooks/useCurrencyBalance";

const SubmitBtn = () => {

  const { selectedToken, termsAccepted } = use(TokensInfoContext)
  const { currencyQuantity, maxPossibleValue } = useCurrencyBalance()
  const { status: netStatus, address: userAddress, chainId } = useNetStatus()
  const { kycStatus, isKYCVerified, isLoading: kycLoading, startKYCVerification } = useKYC()
  
  const [btnText, setBtnText] = useState<'Buy' | 'Verify KYC' | 'Approve' | 'Finalizing'>('Buy')
  const [isProcessing, setIsProcessing] = useState(false)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const client = useQueryClient()
  const config = useConfig()

  const PRESALE_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS as Address;

  // Update button text based on KYC status
  useEffect(() => {
    if (isProcessing) return;
    
    if (!isKYCVerified && !kycLoading) {
      setBtnText('Verify KYC');
    } else if (isKYCVerified) {
      setBtnText('Buy');
    }
  }, [isKYCVerified, kycLoading, isProcessing]);

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
  }, [selectedToken, userAddress, chainId, currencyQuantity])

  const btnDisabled = useMemo(() => {
    if (isProcessing || kycLoading) return true;

    const basicConditions = (
      !termsAccepted ||
      !currencyQuantity ||
      isNaN(parseFloat(currencyQuantity)) ||
      parseFloat(currencyQuantity) <= 0 ||
      netStatus === 'disconnected' ||
      netStatus === 'loading' ||
      !selectedToken ||
      parseFloat(currencyQuantity) > parseFloat(maxPossibleValue)
    );

    return basicConditions;
  }, [termsAccepted, currencyQuantity, netStatus, selectedToken, isProcessing, maxPossibleValue, kycLoading]);

  const needsApproval = () => {
    if (!selectedToken || selectedToken.symbol === 'ETH' || !currencyQuantity) return false

    try {
      const decimals = TOKEN_DECIMALS[selectedToken.symbol as keyof TokenDecimals]
      const amountNeeded = parseUnits(currencyQuantity, decimals)
      return allowance !== amountNeeded
    } catch {
      return false
    }
  }

  const handleApprove = async () => {
    if (!selectedToken || !userAddress) return
    let toastId: string = ''

    try {
      setIsProcessing(true)
      setBtnText('Approve')
      toastId = toast.loading('Approving...', { duration: Infinity })

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

      const newAllowance = await readContract(config, {
        address: selectedToken.address,
        abi: ABIS.ERC20,
        functionName: 'allowance',
        args: [userAddress, PRESALE_ADDRESS],
        chainId
      })
      setAllowance(newAllowance as bigint)

      toast.dismiss(toastId)
      toast.success('Approved!', { duration: 3000 })
      await executeBuy()

    } catch (error) {
      console.error('Approve error:', error)
      setBtnText('Buy')
      setIsProcessing(false)
      toast.dismiss(toastId)
      toast.error('Approval failed')
    }
  }

  const executeBuy = async () => {
    if (!selectedToken || !userAddress) return
    let toastId: string = ''

    try {
      setIsProcessing(true)
      setBtnText('Finalizing')
      toastId = toast.loading('Buying...', { duration: Infinity })

      const decimals = TOKEN_DECIMALS[selectedToken.symbol as keyof TokenDecimals]
      const amount = parseUnits(currencyQuantity, decimals)

      let hash: Address

      if (selectedToken.symbol === 'ETH') {
        const gasBuffer = await readContract(config, {
          address: PRESALE_ADDRESS,
          abi: ABIS.PRESALE,
          functionName: 'gasBuffer',
          chainId
        }) as bigint;

        hash = await writeContract(config, {
          address: PRESALE_ADDRESS,
          abi: ABIS.PRESALE,
          functionName: 'buyWithNative',
          args: [userAddress],
          value: amount + gasBuffer,
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

      setBtnText('Buy')
      setIsProcessing(false)
      client.refetchQueries(['readContract'] as InvalidateQueryFilters)
      toast.success('Tokens reserved!', { duration: 4000 })

    } catch (error: any) {
      console.error('Buy error:', error)
      
      // Check if error is KYC-related
      if (error?.message?.includes('KYC verification required')) {
        toast.error('KYC required')
        setBtnText('Verify KYC')
      } else {
        toast.error('Purchase failed')
        setBtnText('Buy')
      }
      
      setIsProcessing(false)
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (btnDisabled) return

    // First check KYC
    if (!isKYCVerified) {
      startKYCVerification()
      return
    }

    // Then proceed with purchase flow
    if (needsApproval()) {
      await handleApprove()
    } else {
      await executeBuy()
    }
  }

  // Get button message
  const getButtonMessage = () => {
    if (kycLoading) return 'Checking KYC...'
    if (kycStatus === 'rejected') return 'KYC Rejected'
    if (kycStatus === 'expired') return 'KYC Expired'
    if (kycStatus === 'pending') return 'Verifying...'
    return btnText
  }

  return (
    <button
      className={`w-full py-3 md:py-4 mt-4 font-medium border-[1px] border-bg-logo text-bg-logo hover:text-black hover:border-bg-logo hover:bg-bg-logo text-sm md:text-base tracking-tight rounded-l-full rounded-r-full cursor-pointer duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${''}`}
      type="submit"
      onClick={handleSubmit}
      disabled={btnDisabled || kycStatus === 'rejected'}
    >
      {getButtonMessage()}
    </button>
  );
}

export default SubmitBtn;