// contexts/PresaleStatusContext.tsx
import { createContext, PropsWithChildren, useEffect } from 'react';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { ABIS } from '@/utils';
import { Indexable, PresaleStatus } from '@/globalTypes';
import { formatUnits } from 'viem/utils';

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

  const { data, isLoading, refetch: refetchPresaleStatus } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: ABIS.PRESALE,
    functionName: 'getPresaleStatus',
    query: {
      refetchInterval: 30000
    }
  });

  useWatchContractEvent({
    address: PRESALE_ADDRESS,
    abi: ABIS.PRESALE,
    eventName: 'PresaleStarted',
    onLogs: () => refetchPresaleStatus()
  });

  useWatchContractEvent({
    address: PRESALE_ADDRESS,
    abi: ABIS.PRESALE,
    eventName: 'PresaleEnded',
    onLogs: () => refetchPresaleStatus()
  });

  const presaleStatus: PresaleStatus | null = data ? {
    hasStarted: (data as Indexable)[0] as boolean,
    hasEnded: (data as Indexable)[1] as boolean,
    startTime: formatUnits((data as Indexable)[2] as bigint, 0),
    endTime: formatUnits((data as Indexable)[3] as bigint, 0),
    isActive: ((data as Indexable)[0] as boolean) && !((data as Indexable)[1] as boolean) && 
              Math.floor(Date.now() / 1000) <= Number((data as Indexable)[3]),
    canClaim: (data as Indexable)[1] as boolean
  } : null;

  console.log(presaleStatus)

  return (
    <PresaleStatusContext value={{ presaleStatus, isLoading }}>
      {children}
    </PresaleStatusContext>
  );
};

export { PresaleStatusContext, PresaleStatusProvider };