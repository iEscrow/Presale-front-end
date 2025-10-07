import { PresaleStatus } from "@/globalTypes";

type PresaleNotStartedProps = Pick<PresaleStatus, 'startTime'>

const PresaleNotStarted = ({ startTime }: PresaleNotStartedProps) => {
  return (
    <div className="w-full h-[calc(100vh-100px)] flex items-center justify-center">
      <div className="flex items-center justify-center flex-col gap-y-4 text-bg-logo ">
        <h1>iEscrow presale start date</h1>
        <span> { new Date(startTime).toUTCString() } </span>
      </div>
    </div>
  );
}
 
export default PresaleNotStarted;