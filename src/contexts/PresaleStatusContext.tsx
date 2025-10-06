// contexts/PresaleStatusContext.tsx
import { createContext, PropsWithChildren } from 'react';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { ABIS } from '@/utils';

type PresaleStatus = {
  isActive: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  startTime: bigint;
  endTime: bigint;
  canClaim: boolean;
}

type ContextProps = {
  presaleStatus: PresaleStatus | null;
  isLoading: boolean;
}

const PresaleStatusContext = createContext<ContextProps>({
  presaleStatus: null,
  isLoading: true
});

const PresaleStatusProvider = ({ children }: PropsWithChildren) => {
  const PRESALE_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS as `0x${string}`;

  const { data, isLoading, refetch } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: ABIS.PRESALE,
    functionName: 'getPresaleStatus',
    query: {
      refetchInterval: 30000 // Refetch cada 30s
    }
  });

  useWatchContractEvent({
    address: PRESALE_ADDRESS,
    abi: ABIS.PRESALE,
    eventName: 'PresaleStarted',
    onLogs: () => refetch()
  });

  useWatchContractEvent({
    address: PRESALE_ADDRESS,
    abi: ABIS.PRESALE,
    eventName: 'PresaleEnded',
    onLogs: () => refetch()
  });

  const presaleStatus: PresaleStatus | null = data ? {
    hasStarted: data[0] as boolean,
    hasEnded: data[1] as boolean,
    startTime: data[2] as bigint,
    endTime: data[3] as bigint,
    isActive: (data[0] as boolean) && !(data[1] as boolean) && 
              Math.floor(Date.now() / 1000) <= Number(data[3]),
    canClaim: data[1] as boolean
  } : null;

  return (
    <PresaleStatusContext.Provider value={{ presaleStatus, isLoading }}>
      {children}
    </PresaleStatusContext.Provider>
  );
};

export { PresaleStatusContext, PresaleStatusProvider };