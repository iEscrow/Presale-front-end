const GasFee = () => {
  return (
    <div className="w-full flex items-center jutsify-start flex-nowrap text-bg-logo">
      <img className="size-4 md:size-5 text-bg-logo" src="img/gas-fee.svg" alt={'Gas pump'} />
      <span>&nbsp; -</span>
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