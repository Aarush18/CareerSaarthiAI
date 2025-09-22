// src/app/(auth)/auth/sign-in/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInView } from "@/app/modules/auth/ui/views/sign-in-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/"); // already signed in → go home

  return <SignInView />;
}
