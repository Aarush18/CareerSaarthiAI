// src/app/(auth)/auth/sign-up/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignUpView } from "@/app/modules/auth/ui/views/sign-up-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/"); // already signed in → go home

  return <SignUpView />;
}
