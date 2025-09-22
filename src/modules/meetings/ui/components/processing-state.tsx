import { EmptyState } from "@/components/empty-state";

export const ProcessingState = () => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        title="Meeting is Completed"
        description="Meeting has been completed , and summary will be processed soon"
        image="/processing.svg"
      />
    </div>
  );
};
