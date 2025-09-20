// src/trpc/server.ts

import "server-only";
import { headers } from "next/headers";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "@/trpc/routers/_app"; // Adjust path if needed

const getUrl = () => {
  if (typeof window !== "undefined") return ""; 
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getUrl(),
      headers() {
        return {
          ...Object.fromEntries(headers()),
          "x-trpc-source": "rsc",
        };
      },
    }),
  ],
});