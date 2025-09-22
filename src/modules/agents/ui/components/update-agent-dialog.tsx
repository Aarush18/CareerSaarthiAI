"use client";

import { ResponsiveDialog } from "@/components/responsive-dialoge";
import { AgentForm } from "./agent-form";
import { type AgentGetOne } from "../../types";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import type z from "zod";
import { agentsInsertSchema } from "../../schemas";

interface UpdateAgentDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  initialValues: AgentGetOne;
}

export const UpdateAgentDialog = ({
  open,
  onOpenChangeAction,
  initialValues,
}: UpdateAgentDialogProps) => {
  const utils = trpc.useUtils();

  const updateAgent = trpc.agents.update.useMutation({
    onSuccess: async (updated) => {
      await utils.agents.getMany.invalidate();
      if (updated?.id) {
        await utils.agents.getOne.invalidate({ id: updated.id });
      }
      toast.success("Agent updated");
      onOpenChangeAction(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    // ensure we send id + values to the update mutation
    updateAgent.mutate({ id: initialValues.id, ...values });
  };

  return (
    <ResponsiveDialog
      title="Edit Agent"
      description="Edit the Agent details"
      open={open}
      onOpenChange={onOpenChangeAction}
    >
      <AgentForm
        initialValues={initialValues}
        // AgentForm must call this instead of doing its own submit
        // If AgentForm doesn't currently accept onSubmit, add that prop.
        // @ts-expect-error if AgentForm doesn't have onSubmit yet; add it there.
        onSubmit={handleSubmit}
        onCancel={() => onOpenChangeAction(false)}
        onSuccess={() => onOpenChangeAction(false)}
      />
    </ResponsiveDialog>
  );
};