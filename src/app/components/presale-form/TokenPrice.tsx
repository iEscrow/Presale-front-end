const TokenPrice = () => {
  return (
    <div className="w-full flex flex-nowrap items-center justify-center my-8 lg:my-16">
      <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent from-20% via-logo-grad-blue via-70% to-logo-grad-purple to-100%"></div>
      <div className="flex flex-[0_0_auto] mx-4 flex-col items-center justify-center">
        <span className="text-lg font-semibold text-bg-logo mb-1">1 ESCROW</span>
        <span className="font-bold text-xl text-light-blue">$0.015</span>
      </div>
      <div className="flex-1 h-[2px] bg-gradient-to-r from-logo-grad-purple from-0% via-logo-grad-blue via-30% to-transparent to-80%"></div>
    </div>
  );
}
 
export default TokenPrice;