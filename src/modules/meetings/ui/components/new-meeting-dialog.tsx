import { ResponsiveDialog } from "@/components/responsive-dialoge";
import { MeetingForm } from "./meeting-form";
import { Router } from "next/router";
import { useRouter } from "next/navigation";

interface NewMeetingDialogProps {
    open : boolean , 
    onOpenChangeAction : (open : boolean) => void
}

export const NewMeetingDialog = ({
    open ,
    onOpenChangeAction
} : NewMeetingDialogProps) => {

    const router = useRouter()
    return (
        <ResponsiveDialog title="New Meeting" description="Create a new Meeting" open={open} onOpenChange={onOpenChangeAction}>
           <MeetingForm 
                onSuccess={(id) => {
                    onOpenChangeAction(false);
                    router.push(`/meetings/${id}`);
                }}
                onCancel={() => onOpenChangeAction(false)}
           />
        </ResponsiveDialog>
    )
}