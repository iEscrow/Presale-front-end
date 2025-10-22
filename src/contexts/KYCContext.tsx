'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConfig, useReadContract } from 'wagmi';
import { writeContract, waitForTransactionReceipt, readContract } from 'wagmi/actions';
import { Address } from '@/globalTypes';
import useNetStatus from '@/hooks/useNetStatus';
import { ABIS } from '@/utils/utils';
import SumsubWebSdk from "@sumsub/websdk-react";
import toast from 'react-hot-toast';

type KYCStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired' | 'loading';

interface KYCSignature {
  signature: string;
  nonce: string;
  expiry: number;
}

interface KYCContextType {
  kycStatus: KYCStatus;
  kycSignature: KYCSignature | null;
  isKYCVerified: boolean;
  isLoading: boolean;
  startKYCVerification: () => void;
  checkKYCStatus: () => Promise<void>;
  resetKYC: () => void;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const KYCProvider = ({ children }: { children: ReactNode }) => {
  const [kycStatus, setKYCStatus] = useState<KYCStatus>('loading');
  const [kycSignature, setKYCSignature] = useState<KYCSignature | null>(null);
  const [isKYCVerified, setIsKYCVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSumsubModal, setShowSumsubModal] = useState(false);

  const { address: userAddress, chainId } = useNetStatus();
  const config = useConfig();

  const KYC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_KYCVERIFICATION_ADDRESS as Address;

  const { data, error } = useReadContract({
    address: KYC_CONTRACT_ADDRESS,
    abi: ABIS.KYCVERIFICATION,
    functionName: 'isCurrentlyVerified',
    args: userAddress ? [userAddress] : undefined,
    chainId,
  })

  useEffect(() => {
    if(error) {
      console.log('isCurrently verified error: ' + error)
    } else {
      console.log('isCurrently verified data: ' + data)
    }
  }, [data])

  // Check on-chain KYC status
  const checkOnChainKYC = async () => {
    if (!userAddress || !KYC_CONTRACT_ADDRESS) return false;

    try {
      const isVerified = await readContract(config, {
        address: KYC_CONTRACT_ADDRESS,
        abi: ABIS.KYCVERIFICATION,
        functionName: 'isCurrentlyVerified',
        args: [userAddress],
        chainId
      });
      return isVerified as boolean;
    } catch (error) {
      console.error('Error checking on-chain KYC:', error);
      return false;
    }
  };

  // Check backend KYC status
  const checkBackendKYC = async () => {
    if (!userAddress) return;

    try {
      const response = await fetch(`/api/sumsub/getsignature/${userAddress}`);
      const data = await response.json();

      if (data.status === 'approved' && data.hasSignature) {
        setKYCStatus('approved');
        setKYCSignature({
          signature: data.signature,
          nonce: data.nonce,
          expiry: data.expiry
        });
        setIsKYCVerified(true);
      } else if (data.status === 'rejected') {
        setKYCStatus('rejected');
        setIsKYCVerified(false);
      } else if (data.status === 'expired') {
        setKYCStatus('expired');
        setIsKYCVerified(false);
      } else {
        setKYCStatus('not_started');
        setIsKYCVerified(false);
      }
    } catch (error) {
      console.error('Error checking backend KYC:', error);
      setKYCStatus('not_started');
    }
  };

  // Initial check
  const checkKYCStatus = async () => {
    if (!userAddress) {
      setKYCStatus('not_started');
      setIsKYCVerified(false);
      return;
    }

    setIsLoading(true);

    try {
      // First check on-chain
      const onChainVerified = await checkOnChainKYC();
      
      if (onChainVerified) {
        setKYCStatus('approved');
        setIsKYCVerified(true);
        setIsLoading(false);
        return;
      }

      // If not on-chain, check backend
      await checkBackendKYC();
    } catch (error) {
      console.error('Error checking KYC status:', error);
      setKYCStatus('not_started');
    } finally {
      setIsLoading(false);
    }
  };

  // Check KYC when wallet connects
  useEffect(() => {
    checkKYCStatus();
  }, [userAddress, chainId]);

  const startKYCVerification = () => {
    setShowSumsubModal(true);
    setKYCStatus('pending');
  };

  const resetKYC = () => {
    setKYCStatus('not_started');
    setKYCSignature(null);
    setIsKYCVerified(false);
    setShowSumsubModal(false);
  };

  return (
    <KYCContext.Provider
      value={{
        kycStatus,
        kycSignature,
        isKYCVerified,
        isLoading,
        startKYCVerification,
        checkKYCStatus,
        resetKYC
      }}
    >
      {children}
      {showSumsubModal && userAddress && (
        <SumsubModal
          userAddress={userAddress}
          onClose={() => setShowSumsubModal(false)}
          onVerificationComplete={() => {
            setShowSumsubModal(false);
            checkKYCStatus();
          }}
        />
      )}
    </KYCContext.Provider>
  );
};

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};

// Sumsub Modal Component
interface SumsubModalProps {
  userAddress: string;
  onClose: () => void;
  onVerificationComplete: () => void;
}

const SumsubModal = ({ userAddress, onClose, onVerificationComplete }: SumsubModalProps) => {
  const [accessToken, setAccessToken] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const config = useConfig();
  const { chainId } = useNetStatus();
  const KYC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_KYCVERIFICATION_ADDRESS as Address;

  // Get initial access token
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await fetch('/api/sumsub/accesstoken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: userAddress })
        });

        const data = await response.json();
        
        if (data.token) {
          setAccessToken(data.token);
        } else {
          console.error('Error getting access token:', data);
          toast.error('Error loading KYC');
        }
      } catch (error) {
        console.error('Error fetching access token:', error);
        toast.error('Error loading KYC');
      }
    };

    getAccessToken();
  }, [userAddress]);

  // Function to write KYC verification on-chain
  const writeKYCToBlockchain = async (signature: string, nonce: string, expiry: number, verified: boolean) => {
    console.log('=== Writing KYC to Blockchain ===');
    console.log('userAddress:', userAddress);
    console.log('verified:', verified);
    console.log('expiry:', expiry, '→ BigInt:', BigInt(expiry));
    console.log('nonce:', nonce, '→ BigInt:', BigInt(nonce));
    console.log('signature:', signature);
    
    let toastId = '';
    try {
      toastId = toast.loading('Confirming on-chain...', { duration: Infinity });

      const hash = await writeContract(config, {
        address: KYC_CONTRACT_ADDRESS,
        abi: ABIS.KYCVERIFICATION,
        functionName: 'verifyKYC',
        args: [
          userAddress as Address,
          verified,
          BigInt(expiry),
          BigInt(nonce),
          signature as `0x${string}` // ✅ FIX: Cambiado de "as Address" a "as `0x${string}`"
        ],
        chainId
      });

      console.log('✅ KYC verification TX hash:', hash);

      await waitForTransactionReceipt(config, { hash, chainId });
      
      toast.dismiss(toastId);
      toast.success('KYC verified!', { duration: 4000 });
      
      return true;
    } catch (error: any) {
      console.error('❌ Error writing KYC to blockchain:', error);
      toast.dismiss(toastId);
      
      // Handle specific errors
      if (error?.message?.includes('AlreadyVerified')) {
        toast.success('Already verified!');
        return true; // Not an error, user is already verified
      } else if (error?.message?.includes('InvalidNonce')) {
        toast.error('Invalid nonce');
      } else if (error?.message?.includes('InvalidSignature')) {
        toast.error('Invalid signature');
      } else if (error?.message?.includes('InvalidExpiryTimestamp')) {
        toast.error('Invalid expiry');
      } else {
        toast.error('Verification failed');
      }
      
      return false;
    }
  };

  // Polling function
  const startPolling = () => {
    if (isPolling) return;

    setIsPolling(true);
    toast.loading('Verifying documents...', { id: 'kyc-polling' });

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sumsub/getsignature/${userAddress}`);
        const data = await response.json();

        console.log('Polling response:', data);

        if (data.status === 'approved' && data.hasSignature) {
          clearInterval(interval);
          setIsPolling(false);
          toast.dismiss('kyc-polling');
          
          // Write KYC to blockchain
          const success = await writeKYCToBlockchain(
            data.signature, 
            data.nonce, 
            data.expiry,
            true // verified is always true when approved
          );
          
          if (success) {
            onVerificationComplete();
          } else {
            // If blockchain write fails, still close modal but don't mark as complete
            toast.error('Verification failed');
          }
        } else if (data.status === 'rejected') {
          clearInterval(interval);
          setIsPolling(false);
          toast.dismiss('kyc-polling');
          toast.error('KYC rejected');
          onVerificationComplete();
        }
      } catch (error) {
        console.error('Error polling KYC status:', error);
      }
    }, 5000);

    setPollingInterval(interval);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        toast.dismiss('kyc-polling');
      }
    };
  }, [pollingInterval]);

  // Expiration handler - refresh token
  const handleTokenExpiration = async () => {
    try {
      const response = await fetch('/api/sumsub/accesstoken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress })
      });

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return accessToken;
    }
  };

  const handleMessage = (type: string, payload: any) => {
    console.log("WebSDK onMessage", type, payload);

    // Start polling when verification is submitted
    if (type === 'idCheck.onApplicantSubmitted' || type === 'idCheck.onApplicantStatusChanged') {
      startPolling();
    }

    // Handle step completion
    if (type === 'idCheck.stepCompleted') {
      toast.success('Step completed', { duration: 2000 });
    }
  };

  const handleError = (data: any) => {
    console.error("Sumsub error:", data);
    toast.error('Verification error');
  };

  if (!accessToken) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
        <div className="text-white text-lg">Loading verification...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <button
        onClick={onClose}
        className="absolute top-4 right-6 md:right-8 z-[101] h-fit w-fit"
      >
        <img 
          src="img/cancel.svg" alt="" 
          className='size-8 md:size-12 cursor-pointer text-white'
        />
      </button>
      <SumsubWebSdk
        testEnv={process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'}
        accessToken={accessToken}
        expirationHandler={handleTokenExpiration}
        config={{
          theme: 'dark',
        }}
        onMessage={handleMessage}
        onError={handleError}
        className="h-screen w-screen flex items-center justify-center"
      />
    </div>
  );
};