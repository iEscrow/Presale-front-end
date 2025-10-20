'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConfig } from 'wagmi';
import { readContract } from 'wagmi/actions';
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

  const KYC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SIMPLE_KYC_ADDRESS as Address;

  // Check on-chain KYC status
  const checkOnChainKYC = async () => {
    if (!userAddress || !KYC_CONTRACT_ADDRESS) return false;

    try {
      const isVerified = await readContract(config, {
        address: KYC_CONTRACT_ADDRESS,
        abi: ABIS.SIMPLEKYC,
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

      console.log(data)

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

  // Polling function
  const startPolling = () => {
    if (isPolling) return;

    setIsPolling(true);
    toast.loading('Verifying documents...', { id: 'kyc-polling' });

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sumsub/getsignature/${userAddress}`);
        const data = await response.json();

        console.log(data)

        if (data.status === 'approved' && data.hasSignature) {
          clearInterval(interval);
          setIsPolling(false);
          toast.dismiss('kyc-polling');
          toast.success('KYC approved!');
          
          // TODO: Uncomment when final KYC contract is ready
          // await writeKYCToBlockchain(data.signature, data.nonce, data.expiry);
          
          onVerificationComplete();
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
    <div className="fixed h-screen w-screen flex items-center justify-center inset-0 z-[100] bg-black">
      <button className="absolute top-4 right-8 h-fit w-fit text-2xl z-10 cursor-pointer" onClick={onClose}>
        <img 
          src="/img/cancel.svg" 
          alt="Cancel kyc button"
          className='md:size-12 size-8'
        />
      </button>
      <SumsubWebSdk
        testEnv={process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'}
        accessToken={accessToken}
        expirationHandler={handleTokenExpiration}
        onMessage={handleMessage}
        onError={handleError}
        className='h-screen w-screen flex items-center justify-center'
      />
    </div>
  );
};

/* 
TODO: Implement when final KYC contract is ready
This function should verify the KYC signature on-chain

async function writeKYCToBlockchain(signature: string, nonce: string, expiry: number) {
  try {
    const hash = await writeContract(config, {
      address: KYC_CONTRACT_ADDRESS,
      abi: ABIS.KYC,
      functionName: 'verifyKYCWithSignature', // Method name depends on final contract
      args: [userAddress, nonce, expiry, signature],
      chainId
    });

    await waitForTransactionReceipt(config, { hash, chainId });
    toast.success('KYC verified on-chain');
  } catch (error) {
    console.error('Error writing KYC to blockchain:', error);
    toast.error('On-chain verification failed');
  }
}
*/