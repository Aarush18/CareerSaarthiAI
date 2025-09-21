"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client";

export const MeetingView = () => {
  // ✅ tRPC hook + suspense enabled (no queryOptions here)
  const { data } = trpc.meetings.getMany.useQuery({}, { suspense: true });

  // `data` is guaranteed here (because suspense)
  return <div>{JSON.stringify(data)}</div>;
};

export const MeetingsViewLoading = () => (
  <div>
    <LoadingState title="Meetings" description="Loading meetings" />
  </div>
);

export const MeetingsViewError = () => (
  <div>
    <ErrorState title="Meetings" description="Error loading meetings" />
  </div>
);
