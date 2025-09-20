import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { FormControl, FormField, FormItem, FormLabel , Form, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MeetingGetOne } from "../../types";
import { meetingsInsertSchema } from "../../schemas";
import { useState } from "react";
import { CommandSelect } from "@/components/command-select";

interface MeetingFormProps {
    onSuccess? : (id? : string) => void;
    onCancel? : () => void;
    initialValues? : MeetingGetOne;
}

export const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues
} : MeetingFormProps) => {
    const trpc = useTRPC()
    const queryClient = useQueryClient()


    const [opne , setOpen] = useState(false)
    const [agentSearch , setAgentSearch] = useState("")

    const agents = useQuery(trpc.agents.getMany.queryOptions())
    

    const createMeeting = useMutation(trpc.meetings.create.mutationOptions(
        {
            onSuccess: async(data) => {
                await queryClient.invalidateQueries(
                    trpc.meetings.getMany.queryOptions({}),
                );
                if(initialValues?.id){
                await queryClient.invalidateQueries(
                        trpc.meetings.getOne.queryOptions({id: initialValues.id})
                    )
                }
                onSuccess?.(data.id);
            } ,
            onError: (error) => {
                toast.error(error.message)
                
            }
        }
    ));

    const updateMeeting = useMutation(trpc.meetings.update.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({})); // invalidate query tab use hoga jab after updating the db using mutation we want to again fetch that same data 
            if (initialValues?.id) {
                await queryClient.invalidateQueries(
                    trpc.meetings.getOne.queryOptions({ id: initialValues.id })
                );
            }
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message);
        }
    }));


    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver : zodResolver(meetingsInsertSchema),
        defaultValues:{
            name: initialValues?.name ?? "",
            agentId: initialValues?.agentId ?? ""
        }
    })

    const isEdit = !!initialValues?.id;
    const isPending = createMeeting.isPending || updateMeeting.isPending;

    const onSubmit = (values : z.infer<typeof meetingsInsertSchema>) => {
        if(isEdit){
            if (!initialValues?.id) return;
            updateMeeting.mutate({
                ...values,
                id: initialValues.id,
            });
        }else{
            createMeeting.mutate(values);
        }

    }
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
                        <Input {...field} placeholder="e.g Math Consultations"/>
                  </FormControl>
                  <FormMessage/>
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
                         options={(agents.data?.items ?? []).map((agent) => ({
                            id : agent.id,
                            value : agent.id, 
                            children : (
                                <div className="flex items-center gap-x-2">
                                    <GeneratedAvatar seed={agent.name} variant="botttsNeutral" className="border size-6"/>
                                </div>
                            ),
                         })},
                         onSelect={(value) => field.onChange(value)},
                         onSearch={(value) => setAgentSearch(value)}},
                         value={field.value}
                        />
                  </FormControl>
                  <FormMessage/>
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
      
}
