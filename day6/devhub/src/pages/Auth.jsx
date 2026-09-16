import { useState } from "react"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { useNavigate } from "react-router-dom"

import app from "../firebase"

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    const auth = getAuth(app)

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        )
      }

      navigate("/explore")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-zinc-950">

      {/* Left side */}
      <div className="hidden flex-1 flex-col justify-between border-r border-zinc-800 p-10 lg:flex">

        <div className="flex items-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-sm font-bold text-zinc-950">
            D
          </div>

          <span className="text-base font-semibold tracking-tight text-white">
            DevHub
          </span>

        </div>

        <div className="max-w-md">

          <p className="mb-4 font-mono text-[11px] tracking-widest text-zinc-600">
            DEVELOPER COMMUNITY
          </p>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-100">
            Build something.
            <br />
            Share it with others.
          </h1>

          <p className="mt-5 text-sm leading-6 text-zinc-500">
            A place for developers to showcase the things
            they're building and discover projects from others.
          </p>

        </div>

        <p className="text-xs text-zinc-700">
          DevHub · Developer Project Community
        </p>

      </div>

      {/* Right side */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[480px] lg:px-12">

        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="mb-12 flex items-center gap-2 lg:hidden">

            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-sm font-bold text-zinc-950">
              D
            </div>

            <span className="font-semibold text-white">
              DevHub
            </span>

          </div>

          {/* Heading */}
          <div className="mb-8">

            <p className="mb-3 font-mono text-[10px] tracking-widest text-zinc-600">
              {isSignUp ? "CREATE ACCOUNT" : "WELCOME BACK"}
            </p>

            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
              {isSignUp
                ? "Create your account"
                : "Sign in to DevHub"}
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              {isSignUp
                ? "Start sharing your projects with the community."
                : "Continue to your developer workspace."}
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <div>

              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-zinc-600"
              />

            </div>

            <div>

              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-zinc-600"
              />

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md border border-red-900/50 bg-red-950/20 px-3 py-2.5 text-xs leading-5 text-red-400">
                {error.replace("Firebase: Error (auth/", "").replace(").", "")}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-md bg-white text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isSignUp
                ? "Create account"
                : "Sign in"}
            </button>

          </form>

          {/* Switch */}
          <div className="mt-7 border-t border-zinc-800 pt-6 text-center">

            <p className="text-xs text-zinc-600">

              {isSignUp
                ? "Already have an account?"
                : "Don't have an account?"}

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                }}
                className="ml-1 text-zinc-300 transition hover:text-white"
              >
                {isSignUp
                  ? "Sign in"
                  : "Create one"}
              </button>

            </p>

          </div>

        </div>

      </div>

    </main>
  )
}

export default Auth