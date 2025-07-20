'use client'

import { googleLogin } from "@/lib/login"
import { useState } from "react"

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // You'll define this yourself
    // await handleSignup({ name, email, password })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
      <h2 className="text-2xl font-bold">Create an Account</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="text"
          placeholder="Name"
          className="border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="bg-green-600 text-white py-2 rounded">
          Sign Up
        </button>
      </form>

      <hr className="w-full max-w-sm my-4" />

      <button
        onClick={googleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Sign Up with Google
      </button>
    </div>
  )
}
