import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VideoIcon, BanIcon } from "lucide-react";

interface Props {
  meetingId: string;
  onCancelMeeting: () => void;
  isCancelling: boolean;
}

export const UpcomingState = ({ meetingId, onCancelMeeting, isCancelling }: Props) => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        title="No Upcoming Meetings"
        description="You have no upcoming meetings scheduled."
        image="/upcoming.svg"
      />

      <div className="flex flex-col-reverse lg:flex-row lg:justify-center lg:items-center gap-2 w-full">
        <Button
          variant="secondary"
          className="w-full lg:w-auto"
          onClick={onCancelMeeting}
          disabled={isCancelling}
        >
          <BanIcon className="mr-2 h-4 w-4" />
          Cancel Meeting
        </Button>

        <Button asChild disabled={isCancelling} className="w-full lg:w-auto">
          <Link href={`/call/${meetingId}`} className="inline-flex items-center">
            <VideoIcon className="mr-2 h-4 w-4" />
            Start Meeting
          </Link>
        </Button>
      </div>
    </div>
  );
};
