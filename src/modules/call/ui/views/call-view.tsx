"use client";

import { trpc } from "@/trpc/client";
import { ErrorState } from "@/components/error-state";
import { CallProvider } from "../components/call-provider";
// import { CallProvider } from "@/wherever/your/CallProvider/is"; // wire your actual import

interface Props {
  meetingId: string;
}

export const CallView = ({ meetingId }: Props) => {
  // tRPC suspense hook returns an object, not a tuple
  const [data]  = trpc.meetings.getOne.useSuspenseQuery({ id: meetingId });

  if (data.status === "completed") {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState
          title="Meeting has ended"
          description="You can no longer join this meeting"
        />
      </div>
    );
  }

  return <CallProvider meetingId={meetingId} meetingName={data.name} />;

//   if (data?.status === "completed") { return ( <div className="flex h-screen items-center justify-center"> <ErrorState title="Meeting has ended" description="You can no longer join this meeting" /> </div> ); } return ( <div> {JSON.stringify(data, null, 2)} </div> );
};
