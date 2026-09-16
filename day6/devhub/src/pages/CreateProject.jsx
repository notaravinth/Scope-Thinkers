import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"

import { db } from "../firebase"
import { AuthContext } from "../context/AuthContext"

function CreateProject() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [technologies, setTechnologies] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [liveUrl, setLiveUrl] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await addDoc(collection(db, "projects"), {
        title: title,
        description: description,

        technologies: technologies
          .split(",")
          .map((technology) => technology.trim())
          .filter(Boolean),

        githubUrl: githubUrl,
        liveUrl: liveUrl,

        ownerId: user.uid,
        ownerEmail: user.email,

        likes: 0,

        createdAt: serverTimestamp(),
      })

      navigate("/dashboard")
    } catch (error) {
      console.error(error)
      setError("Failed to create project.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-16">

        <Link
          to="/dashboard"
          className="text-xs text-zinc-600 transition hover:text-white"
        >
          ← Back to my projects
        </Link>

        <div className="mt-10 mb-10">
          <p className="mb-3 font-mono text-[11px] tracking-widest text-zinc-600">
            NEW PROJECT
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Share something you've built.
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Add your project details so other developers can discover it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Project name
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DevHub"
              required
              className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your project do?"
              required
              rows={5}
              className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Technologies
            </label>

            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, Firebase, Tailwind"
              required
              className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-zinc-600"
            />

            <p className="mt-2 text-xs text-zinc-700">
              Separate technologies with commas.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              GitHub URL
            </label>

            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Live website
            </label>

            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://..."
              className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-zinc-600"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-900/50 bg-red-950/20 px-3 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-6">

            <Link
              to="/dashboard"
              className="rounded-md border border-zinc-800 px-4 py-2.5 text-sm text-zinc-500 transition hover:border-zinc-700 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish project"}
            </button>

          </div>

        </form>
      </div>
    </main>
  )
}

export default CreateProject
