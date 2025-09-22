"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, XCircleIcon } from "lucide-react"
import { NewAgentDialog } from "./new-agent-dialog"
import { useState } from "react"
import { useAgentsFilter } from "../../hooks/use-agents-filters"
import { SearchFilter } from "./agents-search-filter"
import { DEFAULT_PAGE } from "@/constants"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


const ListHeader = () => {
    const [filters, setFilters] = useAgentsFilter();

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const isAnyFilterModified = !filters.search;

    const onClearFilters = () => {
        setFilters({
            search: ""
            , page: DEFAULT_PAGE,
        })

    }

    return (
        <>
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-md text-xl">My Agents</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon />
                        New Agent
                    </Button>
                </div>
                <ScrollArea>


                    <div className="flex item-center gap-x-2 p-1">
                        <SearchFilter />
                        {!isAnyFilterModified && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                            >
                                <XCircleIcon />
                                Clear
                            </Button>
                        )}

                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            <NewAgentDialog open={isDialogOpen} onOpenChangeAction={setIsDialogOpen} />
        </>
    )
}

export default ListHeader