'use client'

import Image from "next/image";
import CustomConnectButton from "./CustomConnectButton";
import useNetStatus from "@/hooks/useNetStatus";
import { PulseLoader } from "react-spinners";

const NavBar = () => {

  const { status } = useNetStatus()

  return (
    <header className="h-[35px] md:h-[38px] sticky flex flex-col items-center justify-between w-full top-0 px-2 md:px-4 md:pt-1 pt-[3px] box-border z-50 bg-[#101010] sizing-border">
      <div className="relative w-full flex items-center justify-between">
        <div className="h-6 flex items-center justify-between">
          <Image className="mr-2" src={'/escrow-logo.svg'} alt="escrow logo" height={20} width={30} />
          <h1 className="text-bg-logo font-semibold">iEscrow</h1>
        </div>
        {
          status === 'loading' ?
            <div className="flex items-center justify-center h-7 px-2 md:px4 py-[2px] md:py-1">
              <PulseLoader
                color="#EAE9E9"
                size={12}
                speedMultiplier={.8}
              />
            </div> :
            <CustomConnectButton />
        }

      </div>
      <div className="w-full h-[1px] bg-body-text"></div>
    </header>
  );
}

export default NavBar;