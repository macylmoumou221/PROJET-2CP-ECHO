"use client"

import { useMutation } from "convex/react"
import { api } from "../convex/_generated/api"

export function SignOutButton() {
  const signOut = useMutation(api.auth.signOut)
  return (
    <button onClick={() => signOut()} className="bg-slate-500 text-white p-2 rounded-lg">
      Sign Out
    </button>
  )
}
