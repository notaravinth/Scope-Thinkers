import { Link } from "react-router-dom"

function Explore() {
  const projects = [
    {
      id: "1",
      title: "Expense Tracker",
      description:
        "A simple application for tracking personal expenses and monthly spending.",
      author: "Ravi Kumar",
      technologies: ["React", "Firebase", "CSS"],
      likes: 24,
    },
    {
      id: "2",
      title: "Campus Connect",
      description:
        "A platform for students to discover events, clubs and activities around campus.",
      author: "Arjun S",
      technologies: ["React", "Node.js", "MongoDB"],
      likes: 17,
    },
    {
      id: "3",
      title: "Weather Dashboard",
      description:
        "A minimal weather application using location data and a public weather API.",
      author: "Priya M",
      technologies: ["React", "REST API"],
      likes: 11,
    },
  ]

  return (
    <main className="min-h-[calc(100vh-64px)] bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16">

        {/* Header */}
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

        {/* Search / Filter */}
        <div className="mb-5 flex gap-2">

          <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3">

            <span className="text-lg text-zinc-600">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search projects..."
              className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            />

          </div>

          <select className="h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-400 outline-none">
            <option>All technologies</option>
            <option>React</option>
            <option>JavaScript</option>
            <option>Node.js</option>
            <option>Firebase</option>
          </select>

        </div>

        {/* Projects */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {projects.map((project) => (
            <article
              key={project.id}
              className="flex min-h-[285px] flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition hover:-translate-y-0.5 hover:border-zinc-700"
            >

              <div className="mb-6 flex items-center justify-between">

                <span className="font-mono text-[10px] tracking-widest text-zinc-600">
                  PROJECT
                </span>

                <button className="text-xs text-zinc-500 transition hover:text-white">
                  ♡ {project.likes}
                </button>

              </div>

              <h2 className="text-lg font-medium tracking-tight text-zinc-200">
                {project.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="mt-5 flex flex-wrap gap-1.5">

                {project.technologies.map((technology) => (
                  <span
                    key={technology}
                    className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] text-zinc-500"
                  >
                    {technology}
                  </span>
                ))}

              </div>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between pt-6">

                <div className="flex items-center gap-2">

                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[10px] text-zinc-400">
                    {project.author.charAt(0)}
                  </div>

                  <span className="text-xs text-zinc-500">
                    {project.author}
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

      </div>
    </main>
  )
}

export default Explore