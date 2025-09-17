"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client" 

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  const { data: session } = authClient.useSession() 

  // Signup states
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const onSubmit = () => {
    authClient.signUp.email({
      email: signupEmail,
      name: signupName,
      password: signupPassword,
    }, {
      onError: () => {
        window.alert("Something went wrong");
      },
      onSuccess: () => {
        window.alert("Success")
      }
    });
  }

  const onLogin = () => {
    authClient.signIn.email({
      email: loginEmail,
      password: loginPassword,
    }, {
      onError: () => {
        window.alert("Something went wrong");
      },
      onSuccess: () => {
        window.alert("Success")
      }
    });
  }
  
  if(session){
    return( 
      <div className="flex p-4 flex-col gap-y-4">
        <p>Logged in as {session.user?.name}</p>
        <Button onClick={()=>authClient.signOut()}>Sign Out</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-10">
      {/* Signup Form */}
      <div className="flex p-4 flex-col gap-y-4">
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
      <div className="flex p-4 flex-col gap-y-4">
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
