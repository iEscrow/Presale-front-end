type Props = {
  children: React.ReactNode
}

const WithLines = ({ children }: Props) => {

  return (
    <div className="w-full flex flex-nowrap items-center justify-center my-8 md:my-12">
      <div className="flex-1 h-[2px] bg-[linear-gradient(to_left,transparent_10%,theme(colors.bg-logo)_50%,transparent_90%)]"></div>      
      <div className="flex flex-[0_0_auto] flex-col items-center justify-center">
      { children }
      </div>
      <div className="flex-1 h-[2px] bg-[linear-gradient(to_left,transparent_10%,theme(colors.bg-logo)_50%,transparent_90%)]"></div>    
    </div>
  );
}

export default WithLines;