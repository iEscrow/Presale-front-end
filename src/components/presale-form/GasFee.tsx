import { useState } from "react";

const GasFee = () => {

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  return (
    <div className="w-full flex items-center jutsify-start flex-nowrap text-bg-logo">
      <img className="size-4 md:size-5 text-bg-logo" src="img/gas-fee.svg" alt={'Gas pump'} />
      <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
      <div className="relative h-fit w-fit rounded-full">
        <img
          className="size-4 md:size-5 cursor-pointer"
          src="/img/info.svg"
          alt="Information about gas fee estimation"
          onMouseEnter={() => setIsPopoverOpen(true)}
          onMouseLeave={() => setIsPopoverOpen(false)}
        />
        {
          isPopoverOpen &&
          <div className="absolute w-52 md:w-64 inset-x-0 bottom-[calc(100%+6px)] p-2 md:p-3 bg-black/95 animate-appear rounded-sm border-[1px] border-dark-gray pointer-events-none">
            <p className="block w-full md:text-sm text-xs font-light text-bg-logo leading-tight">
              This gas calculation is only a estimation.
              You wallet will set the price of the transation.
              You can modify the gas settings directly from your wallet provider.
            </p>
          </div>
        }

      </div>
    </div>
  );
}

export default GasFee;

/*
const GasFee = () => {
  const { selectedToken, currencyQuantity } = use(TokensInfoContext);
  const { address } = useAccount();
  const { data: gasPrice } = useGasPrice();

  const PRESALE_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS as `0x${string}`;
  const DUMMY_ADDRESS = '0x0000000000000000000000000000000000000001' as `0x${string}`;

  const prepareTransactionData = () => {
    if (!selectedToken || !currencyQuantity || currencyQuantity === '0' || currencyQuantity === '') return undefined;

    try {
      const userAddress = address || DUMMY_ADDRESS;
      const decimals = TOKEN_DECIMALS[selectedToken.symbol as keyof TokenDecimals];

      // ETH nativo
      if (selectedToken.symbol === 'ETH') {
        return {
          to: PRESALE_ADDRESS,
          account: userAddress,
          data: encodeFunctionData({
            abi: ABIS.PRESALE,
            functionName: 'buyWithNative',
            args: [userAddress]
          }),
          value: parseUnits(currencyQuantity, decimals)
        };
      }

      // Tokens ERC20
      return {
        to: PRESALE_ADDRESS,
        account: userAddress,
        data: encodeFunctionData({
          abi: ABIS.PRESALE,
          functionName: 'buyWithToken',
          args: [
            selectedToken.address,
            parseUnits(currencyQuantity, decimals),
            userAddress
          ]
        })
      };
    } catch (error) {
      console.error('Error preparing transaction:', error);
      return undefined;
    }
  };

  const txData = prepareTransactionData();

  const { data: gasEstimate, error: gasError } = useEstimateGas({
    ...txData,
    query: {
      enabled: !!txData,
      retry: false
    }
  });

  // Debug
  if (gasError) {
    console.error('Gas estimation error:', gasError);
  }

  const gasCostInEth = gasEstimate && gasPrice 
    ? formatUnits(gasEstimate * gasPrice, 18)
    : null;

  return (
    <div className="w-full flex items-center justify-start flex-nowrap text-bg-logo">
      <img className="size-4 md:size-5 text-bg-logo" src="img/gas-fee.svg" alt="Gas pump" />
      <span>&nbsp; {gasCostInEth ? `${parseFloat(gasCostInEth).toFixed(6)} ETH` : '-'}</span>
    </div>
  );
}
*/