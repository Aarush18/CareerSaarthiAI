"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar"
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar"

export const HomeView = () => {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  // Signup states
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  // Login states
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const onSubmit = () => {
    authClient.signUp.email(
      {
        email: signupEmail,
        name: signupName,
        password: signupPassword,
      },
      {
        onError: () => window.alert("Something went wrong"),
        onSuccess: () => window.alert("Success"),
      }
    )
  }

  const onLogin = () => {
    authClient.signIn.email(
      {
        email: loginEmail,
        password: loginPassword,
      },
      {
        onError: () => window.alert("Something went wrong"),
        onSuccess: () => window.alert("Success"),
      }
    )
  }

  if (!session) {
    // Show login + signup if not logged in
    return (
      <div className="flex flex-col gap-y-10 p-4">
        {/* Signup Form */}
        <div className="flex flex-col gap-y-4">
          <Input
            placeholder="name"
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
          />
          <Input
            placeholder="email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
          />
          <Input
            placeholder="password"
            type="password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
          />
          <Button onClick={onSubmit}>Create User</Button>
        </div>

        {/* Login Form */}
        <div className="flex flex-col gap-y-4">
          <Input
            placeholder="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <Input
            placeholder="password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <Button onClick={onLogin}>Login</Button>
        </div>
      </div>
    )
  }

  // Show dashboard when logged in
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardNavbar />
        <div className="flex flex-col p-4 gap-y-4">
          <p>Logged in as {session.user?.name}</p>
          <Button
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => router.push("/auth/sign-in"),
                },
              })
            }
          >
            Sign out
          </Button>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
