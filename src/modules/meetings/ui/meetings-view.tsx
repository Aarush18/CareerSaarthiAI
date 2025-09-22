"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client";
import { columns } from "./components/columns";
import { EmptyState } from "@/components/empty-state";

export const MeetingView = () => {
  const { data } = trpc.meetings.getMany.useQuery({}, { suspense: true });

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable data={data?.items ?? []} columns={columns} />
      {data?.items.length === 0 && (
        <EmptyState title="Create your first meeting "
          description="Schedule a meeting to connect with others . Each meeting lets you collaborate , share ideas , and interact with participants in real life"/>
      )}
    </div>
  );
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
