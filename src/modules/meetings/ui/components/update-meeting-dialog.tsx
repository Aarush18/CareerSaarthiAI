import { ResponsiveDialog } from "@/components/responsive-dialoge";
import { MeetingForm } from "./meeting-form";
import { Router } from "next/router";
import { useRouter } from "next/navigation";
import { MeetingGetOne } from "../../types";

interface UpdateMeetingDialogProps {
    open : boolean , 
    onOpenChangeAction : (open : boolean) => void,
    initialValues : MeetingGetOne
}

export const UpdateMeetingDialog = ({
    open ,
    onOpenChangeAction,
    initialValues
} : UpdateMeetingDialogProps) => {

    const router = useRouter()
    return (
        <ResponsiveDialog title="Update Meeting" description="Update the meeting details" open={open} onOpenChange={onOpenChangeAction}>
           <MeetingForm 
                onSuccess={() => {
                    onOpenChangeAction(false);
                }}
                onCancel={() => onOpenChangeAction(false)}
                initialValues={initialValues}
           />
        </ResponsiveDialog>
    )
}