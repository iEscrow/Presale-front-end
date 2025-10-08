 'use client'
 
 type Props = {
  withBg?: boolean
  children: React.ReactNode
}

const PresalePlaceholderWrapper = ({ children, withBg = true }: Props) => {
  return (
    <div className="relative w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden px-4">
      {
        children
      }
      <img
        style={{ display: withBg ? 'block' : 'none' }}
        src="/escrow-logo.svg"
        alt=""
        className="absolute md:rotate-0 
                   rotate-90 scale-125 md:scale-100 opacity-40 md:opacity-100 size-100 md:size-200 
                   horizontal-masked select-none pointer-events-none"
      />
    </div>
  );
}
 
export default PresalePlaceholderWrapper;