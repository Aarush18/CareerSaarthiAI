"use client";

import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import type { AppRouter } from "./routers/_app";
import { makeQueryClient } from "./query-client";

export const trpc = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // server: always new client
    return makeQueryClient();
  }
  // client: keep a singleton
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function getUrl() {
  const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL;
  return `${base}/api/trpc`;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: getUrl() })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
