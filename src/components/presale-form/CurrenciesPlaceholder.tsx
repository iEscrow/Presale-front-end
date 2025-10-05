type Props = {
  text: string,
  children: React.ReactNode
}

const CurrenciesLoading = ({ text, children }: Props) => {
  return (
    <div className="absolute inset-0 w-full flex flex-col items-center justify-center my-6">
      { children }
      <span className="font-poppins text-xs md:text-sm tracking-tight font-light text-bg-logo"> {text} </span>
    </div>
  );
}

export default CurrenciesLoading;