import useNetStatus from "@/hooks/useNetStatus";
import { ABIS } from "@/utils";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";

const ESCROWBalance = () => {

  const { status: netStatus, address: userAddress, chainId } = useNetStatus()

  const { data: escrowBalance, isLoading: iEscrowBalanceLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_UNITY_FINANCE_ADDRESS as `0x${string}`,
    abi: ABIS.ERC20,
    chainId,
    functionName: 'balanceOf',
    args: [userAddress],
    query: {
      enabled: netStatus === 'connected',
    }
  });

  return (
    <div className="w-full py-4 md:py-6 px-3 md:px-4 flex items-center justify-between bg-gray/5 tracking-tight rounded-l-md rounded-r-md">
      <span className="text-bg-logo text-[14px] md:text-sm font-medium">Your $ESCROW balance</span>
      <span className="text-bg-logo text-[14px] md:text-sm font-medium">
      {
        netStatus === 'disconnected' || netStatus === 'loading' || iEscrowBalanceLoading ? '-'  :
        formatUnits(BigInt(escrowBalance as string), 18) + ' $ESCROW'
      }
      </span>
    </div>
  );
}

export default ESCROWBalance;