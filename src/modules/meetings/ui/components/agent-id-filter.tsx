import { useState } from "react";
import { trpc } from "@/trpc/client";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useMeetingsFilter } from "../../hooks/use-meetings-filter";

export const AgentIdFilter = () => {
  const [filters, setFilters] = useMeetingsFilter();
  const [agentSearch, setAgentSearch] = useState("");

  const { data } = trpc.agents.getMany.useQuery({
    pageSize: 100,
    search: agentSearch,
  });

  return (
    <CommandSelect
      placeholder="Agent"
      className="h-9 w-auto min-w-[160px] max-w-[220px] flex-shrink-0"
      options={(data?.items ?? []).map((agent) => ({
        id: agent.id,
        value: agent.id,
        children: (
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              seed={agent.name}
              variant="botttsNeutral"
              className="size-4"
            />
            <span className="truncate max-w-[120px]">{agent.name}</span>
          </div>
        ),
      }))}
      onSelect={(value) => setFilters({ agentId: value })}
      onSearch={setAgentSearch}
      value={filters.agentId ?? ""}
    />
  );
};
