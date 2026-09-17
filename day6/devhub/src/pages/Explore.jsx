import { useState } from "react"
import { Link } from "react-router-dom"

import useProjects from "../hooks/useProjects"

function Explore() {
  const { projects, loading, error } = useProjects()

  const [search, setSearch] = useState("")
  const [technology, setTechnology] = useState("All technologies")

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      project.description
        ?.toLowerCase()
        .includes(search.toLowerCase())

    const matchesTechnology =
      technology === "All technologies" ||
      project.technologies?.includes(technology)

    return matchesSearch && matchesTechnology
  })

  return (
    <main className="min-h-[calc(100vh-64px)] bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16">

        <div className="mb-10 flex items-end justify-between">

          <div>
            <p className="mb-3 font-mono text-[11px] tracking-widest text-zinc-600">
              COMMUNITY
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">
              Discover projects.
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Explore what other developers are building.
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-semibold text-zinc-200">
              {projects.length}
            </p>

            <p className="text-xs text-zinc-600">
              projects
            </p>
          </div>

        </div>

        <div className="mb-5 flex gap-2">

          <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3">

            <span className="text-lg text-zinc-600">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            />

          </div>

          <select
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            className="h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-400 outline-none"
          >
            <option>All technologies</option>
            <option>React</option>
            <option>JavaScript</option>
            <option>Node.js</option>
            <option>Firebase</option>
            <option>Tailwind</option>
          </select>

        </div>

        {loading && (
          <div className="border-t border-zinc-800 py-16 text-center">
            <p className="text-sm text-zinc-600">
              Loading projects...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="border-t border-zinc-800 py-16 text-center">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && filteredProjects.length === 0 && (
          <div className="border-t border-zinc-800 py-16 text-center">
            <p className="text-sm text-zinc-500">
              No projects found.
            </p>
          </div>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="flex min-h-[285px] flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition hover:-translate-y-0.5 hover:border-zinc-700"
              >

                <div className="mb-6 flex items-center justify-between">

                  <span className="font-mono text-[10px] tracking-widest text-zinc-600">
                    PROJECT
                  </span>

                  <span className="text-xs text-zinc-500">
                    ♡ {project.likes || 0}
                  </span>

                </div>

                <h2 className="text-lg font-medium tracking-tight text-zinc-200">
                  {project.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {project.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {project.technologies?.map((technology) => (
                    <span
                      key={technology}
                      className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] text-zinc-500"
                    >
                      {technology}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-6">

                  <div className="flex items-center gap-2">

                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[10px] text-zinc-400">
                      {project.ownerEmail
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="max-w-32 truncate text-xs text-zinc-500">
                      {project.ownerEmail}
                    </span>

                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="text-xs text-zinc-400 transition hover:text-white"
                  >
                    View project →
                  </Link>

                </div>

              </article>
            ))}

          </div>
        )}

      </div>
    </main>
  )
}

export default Explore