"use client"
import { ResponsiveDialog } from "@/components/responsive-dialoge"
import { AgentForm } from "./agent-form"


interface NewAgentDialogProps {
    open: boolean,
    onOpenChangeAction : (open : boolean) => void
}

export const NewAgentDialog = ({
    open ,
    onOpenChangeAction
} : NewAgentDialogProps) => {
    return (
        <ResponsiveDialog title="New Agent" description="Create a new Agent" open={open} onOpenChange={onOpenChangeAction}>
            <AgentForm onSuccess={() => onOpenChangeAction(false)} onCancel={() => onOpenChangeAction(false)}/>
        </ResponsiveDialog>
    )
}