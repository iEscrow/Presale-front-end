'use client'

import { use } from "react";
import PresaleForm from "../components/presale-form/PresaleForm";
import './globals.css'
import { PresaleStatusContext } from "@/contexts/PresaleStatusContext";
import PresaleNotStarted from "@/components/presale-not-started/PresaleNotStarted";

export default function Home() {

  const { presaleStatus, isLoading } = use(PresaleStatusContext)

  return (
    <div className="w-auto overflow-clip px-2 md:px-4 py-2 flex items-center justify-center">
      <PresaleForm />
      {/* <PresaleNotStarted startTime={presaleStatus?.startTime || Date.now().toString()} /> */}
    </div>
  );
}
