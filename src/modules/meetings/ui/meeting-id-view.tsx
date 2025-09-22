"use client"

import { trpc } from "@/trpc/client";
import { MeetingIdViewHeader } from "./components/meeting-id-view-header";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { useState } from "react";
import { UpdateMeetingDialog } from "./components/update-meeting-dialog";
import { UpcomingState } from "./components/upcoming-state";
import { ActiveState } from "./components/active-state";
import { CancelledState } from "./components/cancelled-state";
import { ProcessingState } from "./components/processing-state";


interface Props {
  meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {

  const [data] = trpc.meetings.getOne.useSuspenseQuery({ id: meetingId });

  const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

  const router = useRouter();

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    "The following action will remove this meeting "
  )

  const utils = trpc.useUtils();
  const removeMeeting = trpc.meetings.remove.useMutation({
    onSuccess: async () => {
      await utils.meetings.getMany.invalidate();
      await utils.meetings.getOne.invalidate({ id: meetingId });

      router.push("/meetings");
    },
  });

  const handleRemoveMeeting = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    await removeMeeting.mutateAsync({ id: meetingId });
  };

  const isActive = data.status === "active";
  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";
  const isCompleted = data.status === "completed";
  const isProcessing = data.status === "processing";


  return (
    <>
      <RemoveConfirmation />
      <UpdateMeetingDialog
        open={updateMeetingDialogOpen}
        onOpenChangeAction={setUpdateMeetingDialogOpen}
        initialValues={data}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <MeetingIdViewHeader
          meetingId={meetingId}
          meetingName={data.name}
          onEdit={() => setUpdateMeetingDialogOpen(true)}
          onDelete={handleRemoveMeeting}
        />
        {isCancelled && <CancelledState />}
        {isProcessing && <ProcessingState />}
        {isCompleted && <div>Completed</div>}
        {isActive && <ActiveState meetingId={meetingId}/>}
        {isUpcoming && (<UpcomingState 
          meetingId={meetingId}
          onCancelMeeting={() => {}}
          isCancelling={false}
        />)}
      </div>
    </>
  );
};




export const MeetingIdViewLoading = () => (
  <LoadingState title="Loading" description="This may take a few seconds" />
);
export const MeetingIdViewError = () => (
  <ErrorState title="Error Loading Meeting" description="Something went wrong" />
);