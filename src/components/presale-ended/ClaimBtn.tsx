type Props = {
  canClaim: boolean,
  text: string,
}

const ClaimBtn = ({ canClaim, text }: Props) => {

  const handleSubmit = () => {

  }

  return (
    <button 
      type="button" 
      onClick={handleSubmit}
      className="w-full py-3 md:py-4 mt-4 font-medium border-[1px] border-bg-logo text-bg-logo text-sm md:text-base tracking-tight rounded-l-full rounded-r-full cursor-pointer duration-200 hover:text-black hover:border-bg-logo hover:bg-bg-logo disabled:cursor-not-allowed disabled:opacity-70"
      disabled={!canClaim}
    >
      { text }
    </button>
  );
}
 
export default ClaimBtn;