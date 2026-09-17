import { useContext } from "react"
import { Link } from "react-router-dom"

import { AuthContext } from "../context/AuthContext"
import useProjects from "../hooks/useProjects"

function Dashboard() {
  const { user } = useContext(AuthContext)

  const {
    projects,
    loading,
    error,
  } = useProjects(user?.uid)

  const totalLikes = projects.reduce(
    (total, project) => total + (project.likes || 0),
    0
  )

  return (
    <main className="min-h-[calc(100vh-64px)] bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16">

        <div className="mb-10 flex items-end justify-between">

          <div>
            <p className="mb-3 font-mono text-[11px] tracking-widest text-zinc-600">
              YOUR WORKSPACE
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">
              My Projects
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Manage the projects you've shared with the community.
            </p>
          </div>

          <Link
            to="/projects/new"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            + New project
          </Link>

        </div>

        <div className="mb-10 flex gap-3">

          <div className="w-44 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs text-zinc-600">
              Total projects
            </p>

            <p className="mt-2 text-2xl font-semibold text-zinc-200">
              {projects.length}
            </p>
          </div>

          <div className="w-44 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs text-zinc-600">
              Total likes
            </p>

            <p className="mt-2 text-2xl font-semibold text-zinc-200">
              {totalLikes}
            </p>
          </div>

        </div>

        {loading && (
          <div className="border-t border-zinc-800 py-10 text-center">
            <p className="text-sm text-zinc-600">
              Loading your projects...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="border-t border-zinc-800 py-10 text-center">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="border-t border-zinc-800 py-16 text-center">
            <p className="text-sm text-zinc-500">
              You haven't published any projects yet.
            </p>

            <Link
              to="/projects/new"
              className="mt-4 inline-block text-xs text-zinc-300 transition hover:text-white"
            >
              Create your first project →
            </Link>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="border-t border-zinc-800">

            {projects.map((project) => (
              <article
                key={project.id}
                className="flex items-center justify-between border-b border-zinc-800 py-5"
              >

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 font-mono text-sm text-zinc-500">
                    {project.title?.charAt(0).toUpperCase()}
                  </div>

                  <div>

                    <h2 className="text-sm font-medium text-zinc-200">
                      {project.title}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-600">
                      {project.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.technologies?.map((technology) => (
                        <span
                          key={technology}
                          className="rounded border border-zinc-800 px-2 py-1 font-mono text-[10px] text-zinc-600"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <span className="mr-3 text-xs text-zinc-600">
                    ♡ {project.likes || 0}
                  </span>

                  <Link
                    to={`/projects/${project.id}`}
                    className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-zinc-700 hover:text-white"
                  >
                    View
                  </Link>

                  <button
                    className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-zinc-700 hover:text-white"
                  >
                    Edit
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </div>
    </main>
  )
}

export default Dashboard