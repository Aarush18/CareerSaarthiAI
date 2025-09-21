"use client";

import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CommandSelect } from "@/components/command-select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import z from "zod";

import { MeetingGetOne } from "../../types";
import { meetingsInsertSchema } from "../../schemas";

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: MeetingFormProps) => {
  const utils = trpc.useUtils(); // ✅ invalidate helper

  const [agentSearch, setAgentSearch] = useState("");

  // ✅ Hooks client -> useQuery directly (no queryOptions here)
  const agents = trpc.agents.getMany.useQuery({
    pageSize: 100,
    search: agentSearch,
  });

  // ✅ Hooks client -> useMutation directly
  const createMeeting = trpc.meetings.create.useMutation({
    onSuccess: async (data) => {
      await utils.meetings.getMany.invalidate({});
      if (initialValues?.id) {
        await utils.meetings.getOne.invalidate({ id: initialValues.id });
      }
      onSuccess?.(data.id);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMeeting = trpc.meetings.update.useMutation({
    onSuccess: async () => {
      await utils.meetings.getMany.invalidate({});
      if (initialValues?.id) {
        await utils.meetings.getOne.invalidate({ id: initialValues.id });
      }
      onSuccess?.();
    },
    onError: (error) => toast.error(error.message),
  });

  const form = useForm<z.infer<typeof meetingsInsertSchema>>({
    resolver: zodResolver(meetingsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      agentId: initialValues?.agentId ?? "",
    },
  });

  const isEdit = !!initialValues?.id;
  const isPending = createMeeting.isPending || updateMeeting.isPending;

  const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
    if (isEdit) {
      if (!initialValues?.id) return;
      updateMeeting.mutate({ ...values, id: initialValues.id });
    } else {
      createMeeting.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g Math Consultations" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="agentId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent</FormLabel>
              <FormControl>
                <CommandSelect
                  value={field.value}
                  onSelect={(val) => field.onChange(val)}
                  onSearch={(val) => setAgentSearch(val)}
                  placeholder="Search agent…"
                  options={(agents.data?.items ?? []).map((agent) => ({
                    id: agent.id,
                    value: agent.id,
                    label: agent.name, // visible text for the row/input
                    children: (
                      <div className="flex items-center gap-x-2">
                        <GeneratedAvatar
                          seed={agent.name}
                          variant="botttsNeutral"
                          className="border size-6"
                        />
                        <span className="truncate">{agent.name}</span>
                      </div>
                    ),
                  }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button
              variant="ghost"
              disabled={isPending}
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button disabled={isPending} type="submit">
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
