"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../convex/_generated/api"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const signIn = useMutation(api.auth.signIn)
  const signUp = useMutation(api.auth.signUp)

  async function handleSubmit(event, mode) {
    event.preventDefault()
    setError("")
    try {
      if (mode === "sign-up") {
        await signUp({ email, password })
      } else {
        await signIn({ email, password })
      }
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-slate-600">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-slate-200 rounded-lg p-2"
          placeholder="me@email.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-slate-600">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-slate-200 rounded-lg p-2"
          placeholder="super-secure-password"
        />
      </div>
      {error && <p className="text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          onClick={(e) => handleSubmit(e, "sign-in")}
          className="flex-1 bg-indigo-500 text-white p-2 rounded-lg"
        >
          Sign In
        </button>
        <button
          type="submit"
          onClick={(e) => handleSubmit(e, "sign-up")}
          className="flex-1 bg-slate-500 text-white p-2 rounded-lg"
        >
          Sign Up
        </button>
      </div>
    </form>
  )
}
