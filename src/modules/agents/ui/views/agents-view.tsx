"use client";

import { trpc } from "@/trpc/client"; // <-- Make sure this path is correct!
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentsFilter } from "../../hooks/use-agents-filters";
import { set } from "zod";
import { DataPagination } from "../components/data-pagination";
import { useSuspenseQuery } from "@tanstack/react-query";

export const AgentsView = () => {
    const [filters, setFilters] = useAgentsFilter();
    const [data] = trpc.agents.getMany.useSuspenseQuery({});

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
          
            <DataTable data={data.items} columns={columns}/>
            <DataPagination 
            page={filters.page}
            totalPages={data.totalPages}
            onPageChange = {(page)=> setFilters({page})
            }
                  />      {data.items.length === 0 && (
                <EmptyState title="Create your first agent "
                description="Create an agent to join your meeting . Each agent will follow your instructions and can intract with participants during the call "/>
            )}

            </div>
    )
}
