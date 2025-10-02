'use client'

import { ALLOWED_NETS } from "@/utils";
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";

const useNetStatus = () => {

  const [status, setStatus] = useState<'connected'|'disconnected'|'loading'>('disconnected')
  const { data, status: sessionStatus } = useSession()
  const { isConnected, address, isConnecting } = useAccount()
  const chainId = useChainId()

  const verifyNetStatus = () => {
    if (isConnected && data && chainId && ALLOWED_NETS.includes(chainId)) {
      setStatus('connected')
    } else {
      if(sessionStatus === 'loading' && isConnecting) {
        setStatus('loading')
        return
      }
      setStatus('disconnected')
    }
  }

  useEffect(() => {
    verifyNetStatus()
  }, [isConnected, data, chainId])

  return {
    status,
    address,
    chainId
  };
}
 
export default useNetStatus;