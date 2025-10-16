// contexts/PresaleStatusContext.tsx
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { ABIS } from "@/utils";
import { Indexable, PresaleStatus } from "@/globalTypes";
import { formatUnits } from "viem/utils";

type ContextProps = {
  presaleStatus: PresaleStatus | null;
  isLoading: boolean;
};

const PresaleStatusContext = createContext<ContextProps>({
  presaleStatus: null,
  isLoading: true,
});

const PresaleStatusProvider = ({ children }: PropsWithChildren) => {
  const PRESALE_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS as `0x${string}`;
  const publicClient = usePublicClient({
    chainId: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' ? 31337 : 1
  });

  const [presaleStatus, setPresaleStatus] = useState<PresaleStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPresaleStatus = async () => {
    if (!publicClient) return;

    try {
      setIsLoading(true);
      const data = (await publicClient.readContract({
        address: PRESALE_ADDRESS,
        abi: ABIS.PRESALE,
        functionName: "getPresaleStatus",
      })) as Indexable;

      const parsed: PresaleStatus = {
        hasStarted: data[0] as boolean,
        hasEnded: data[1] as boolean,
        startTime: formatUnits(data[2] as bigint, 0),
        endTime: formatUnits(data[3] as bigint, 0),
        isActive:
          (data[0] as boolean) &&
          !(data[1] as boolean) &&
          Math.floor(Date.now() / 1000) <= Number(data[3]),
        canClaim: data[1] as boolean,
      };

      setPresaleStatus(parsed);
    } catch (error) {
      console.error("Error fetching presale status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto inicial + refetch periódico
  useEffect(() => {
    fetchPresaleStatus();
  }, []);

  // Escuchar eventos on-chain y actualizar en tiempo real
  useWatchContractEvent({
    address: PRESALE_ADDRESS,
    abi: ABIS.PRESALE,
    eventName: "PresaleStarted",
    onLogs: fetchPresaleStatus,
    batch: false,
    pollingInterval: 900000,
    syncConnectedChain: true
  });

  useWatchContractEvent({
    address: PRESALE_ADDRESS,
    abi: ABIS.PRESALE,
    eventName: "PresaleEnded",
    onLogs: fetchPresaleStatus,
    batch: false,
    pollingInterval: 900000,
    syncConnectedChain: true
  });

  return (
    <PresaleStatusContext.Provider value={{ presaleStatus, isLoading }}>
      {children}
    </PresaleStatusContext.Provider>
  );
};

export { PresaleStatusContext, PresaleStatusProvider };
