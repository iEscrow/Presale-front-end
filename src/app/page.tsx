'use client'

import { use } from "react";
import PresaleForm from "../components/presale-form/PresaleForm";
import './globals.css'
import { PresaleStatusContext } from "@/contexts/PresaleStatusContext";
import PresaleNotStarted from "@/components/placeholders/PresaleNotStarted";
import toast, { resolveValue, ToastBar, Toaster } from "react-hot-toast";
import Toast from "@/components/Toast";
import PresalePlaceholderWrapper from "@/components/placeholders/PresalePlaceholderWrapper";
import FetchingPresaleStatus from "@/components/FetchingPresaleStatus";

export default function Home() {

  const { presaleStatus, isLoading } = use(PresaleStatusContext)

  return (
    <div className="relative w-auto overflow-clip px-2 md:px-4 py-4 flex items-center justify-center">
      {/* <PresaleForm /> */}
      {/* <PresalePlaceholderWrapper withBg={false} >
        <FetchingPresaleStatus/>
      </PresalePlaceholderWrapper> */}
      <Toast/>
    </div>
  );
}

/*
      {
        isLoading || presaleStatus === null ? (
          <PresalePlaceholderWrapper>
            <FetchingPresaleStatus/>
          </PresalePlaceholderWrapper>
        ) : !presaleStatus.hasStarted ? (
          <PresalePlaceholderWrapper>
            <PresaleNotStarted {...presaleStatus} />
          </PresalePlaceholderWrapper>
        ) : presaleStatus.hasStarted ? (
          <PresaleForm/>
        ) : presaleStatus.hasEnded ? (
          <PresalePlaceholderWrapper>
            <PresaleEnded/>
          </PresalePlaceholderWrapper>
        ) : <></>
      }
*/
