// src/app/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HomeView } from "@/app/modules/home/ui/views/home-view";

export const dynamic = "force-dynamic"; // or: export const revalidate = 0

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  // HomeView should be a CLIENT component that renders your dashboard shell/content
  return <HomeView />;
}
