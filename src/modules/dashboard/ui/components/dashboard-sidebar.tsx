"use client";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BotIcon, StarIcon, VideoIcon, Brain } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardUserButton } from "./dashboard-user-button";

const firstSection = () => [
  {
    icon: VideoIcon,
    label: "Meetings",
    href: "/meetings",
  },
  {
    icon: BotIcon,
    label: "Agents",
    href: "/agents",
  },
  {
    icon: Brain,
    label: "Aptitude Quiz",
    href: "/quiz",
  },
];

const SecondSection = () => [
  {
    icon: StarIcon,
    label: "Upgrade",
    href: "/upgrade",
  },
];

type DashboardSidebarProps = {
  children?: React.ReactNode;
};

export const DashboardSidebar = ({ children }: DashboardSidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      <Sidebar>
        <SidebarHeader className="text-sidebar-accent-foreground">
          <Link href="/" className="flex items-center gap-2 px-2 pt-2">
            <Image
              src="/logo.svg"
              height={36}
              width={36}
              alt="logo"
              className="rounded-2xl"
            />
            <p className="text-2xl font-semibold">Vidu AI</p>
          </Link>
        </SidebarHeader>
        <div className="px-4 py-2">
          <Separator className="opacity-10 text-[#5D6B68]" />
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {firstSection().map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                          pathname == item.href &&
                            "bg-linear-to-r/oklch border border-[#5D6B68]/10"
                        )}
                        isActive={pathname == item.href}
                      >
                        <Link href={item.href}>
                          <Icon className="size-5" />
                          <span className="text-sm font-medium tracking-tight">
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="px-4 py-2">
            <Separator className="opacity-10 text-[#5D6B68]" />
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {SecondSection().map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                          pathname == item.href &&
                            "bg-linear-to-r/oklch border border-[#5D6B68]/10"
                        )}
                        isActive={pathname == item.href}
                      >
                        <Link href={item.href}>
                          <Icon className="size-5" />
                          <span className="text-sm font-medium tracking-tight">
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="text-white">
                <DashboardUserButton/>
        </SidebarFooter>
      </Sidebar>
      {children}
    </>
  );
};
