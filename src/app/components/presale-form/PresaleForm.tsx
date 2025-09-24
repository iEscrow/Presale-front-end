'use server'

import TokenPrice from "./TokenPrice";

const PresaleForm = () => {
  return (
    <form className="max-w-[800px] py-4 px-2 md:px-4 md:py-8 rounded-md border-[1px] border-body-text ">
      <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left text-bg-logo">
        Buy <span className="escrow-text-gradient">ESCROW</span> Token
      </h1>
      <TokenPrice/>
    </form>
  );
}
 
export default PresaleForm;