import { PresaleStatus } from "@/globalTypes";
import { formatTimestampToUTC } from "@/utils";

type PresaleNotStartedProps = PresaleStatus;

const PresaleNotStarted = ({ startTime }: PresaleNotStartedProps) => {
  return (
    <div className="z-10 flex flex-col items-center justify-center gap-y-3 text-bg-logo tracking-tight text-center">
      <h1 className="font-semibold text-3xl md:text-5xl leading-tight">
        iEscrow presale starts soon
      </h1>
      <p className="font-light text-lg md:text-xl">
        Our token presale first round will begin on:
      </p>
      <time className="text-2xl md:text-3xl my-6 md:my-8 font-bold">
        {formatTimestampToUTC(startTime)}
      </time>
      <p className="font-light text-base md:text-xl my-2 md:my-4">
        Get your wallet ready and join us at launch on Ethereum Mainnet!
        <br className="hidden md:block" />
        Be among the first to participate in this exciting opportunity.
      </p>
    </div>
  );
};

export default PresaleNotStarted;
