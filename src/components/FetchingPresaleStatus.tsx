'use client'

import { useWindowSize } from "@uidotdev/usehooks";
import { PuffLoader } from "react-spinners";

const FetchingPresaleStatus = () => {

  const { width } = useWindowSize()

  return (
    <div className="flex flex-col items-center justify-center">
      <PuffLoader
        className="mb-4 md:mb-6 text-bg-logo"
        color="#EAE9E9"
        size={(width || 1000) >= 768 ? 80 : 60}
      />
      <h1 className="text-base md:text-lg text-bg-logo tracking-tight leading-0">Getting presale status</h1>
    </div>
  );
}
 
export default FetchingPresaleStatus;