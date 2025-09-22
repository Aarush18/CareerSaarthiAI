import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VideoIcon } from "lucide-react";

interface Props {
  meetingId: string;
}

export const ActiveState = ({ meetingId }: Props) => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        title="Meeting is Active"
        description="Meeting will end once all the participants have left"
        image="/upcoming.svg"
      />
        <Button asChild className="w-full lg:w-auto">
          <Link href={`/call/${meetingId}`} className="inline-flex items-center">
            <VideoIcon className="mr-2 h-4 w-4" />
            Join Meeting
          </Link>
        </Button>
      </div>
  );
};
