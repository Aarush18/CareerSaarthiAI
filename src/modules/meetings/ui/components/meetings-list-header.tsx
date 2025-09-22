"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, XCircleIcon } from "lucide-react"
import { useState } from "react"
import { NewMeetingDialog } from "./new-meeting-dialog"
import { MeetingsSearchFilter } from "./meetings-search-filter"
import { StatusFilters } from "./status-filter"
import { AgentIdFilter } from "./agent-id-filter"
import { useMeetingsFilter } from "../../hooks/use-meetings-filter"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


const MeetingsListHeader = () => {

    const [filters, setFilters] = useMeetingsFilter();
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const isAnyFilterModified =
        !!filters.status || !!filters.search || !!filters.agentId;

    const onClearFilters = () => {
        setFilters({
            status: null,
            agentId: "",
            search: "",
            page: 1,
        });
    };


    return (
        <>
            <NewMeetingDialog open={isDialogOpen} onOpenChangeAction={setIsDialogOpen} />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-md text-xl">My Meetings</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon />
                        New Meeting
                    </Button>
                </div>
                <ScrollArea>
                    <div className="flex items-center gap-x-2 p-1">
                        <MeetingsSearchFilter />
                        <StatusFilters />
                        <AgentIdFilter />
                        {isAnyFilterModified && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-600/10"
                                onClick={onClearFilters}
                            >
                                <XCircleIcon className="size-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </>
    )
}

export default MeetingsListHeader