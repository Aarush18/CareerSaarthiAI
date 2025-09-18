import { LoadingState } from "@/components/loading-state";
import { auth } from "@/lib/auth";
import ListHeader from "@/modules/agents/ui/components/list-header";
import { AgentsView } from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";
import {
  dehydrate,
  HydrationBoundary,
  useQueryClient,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const Page = async() => {

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());
  return (
    <>
     <ListHeader/>
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={<LoadingState title="Loading" description="Loading agents" />}
      >
        <AgentsView />
      </Suspense>
    </HydrationBoundary>
    </>
  );
};

export default Page;
