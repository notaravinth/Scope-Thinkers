import { Link, useParams } from "react-router-dom"

function ProjectDetails() {
  const { id } = useParams()

  return (
    <main className="min-h-[calc(100vh-64px)] bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-16">

        <Link
          to="/explore"
          className="text-xs text-zinc-600 transition hover:text-white"
        >
          ← Back to explore
        </Link>

        <div className="mt-10 grid gap-16 lg:grid-cols-[1fr_280px]">

          {/* Main */}
          <div>

            <div className="flex items-center gap-4 border-b border-zinc-800 pb-8">

              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 font-mono text-lg text-zinc-500">
                P
              </div>

              <div>

                <p className="mb-1 font-mono text-[10px] tracking-widest text-zinc-600">
                  PROJECT
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
                  Project {id}
                </h1>

                <p className="mt-1 text-xs text-zinc-600">
                  Built by Ravi Kumar
                </p>

              </div>

            </div>

            <div className="border-b border-zinc-800 py-8">

              <h3 className="mb-3 text-sm font-medium text-zinc-300">
                About this project
              </h3>

              <p className="max-w-2xl text-sm leading-7 text-zinc-500">
                This is where the complete project description will
                appear. Once we connect Firestore, this information
                will come directly from the project stored in Firebase.
              </p>

            </div>

            <div className="py-8">

              <h3 className="mb-4 text-sm font-medium text-zinc-300">
                Technologies
              </h3>

              <div className="flex flex-wrap gap-2">

                {["React", "Firebase", "JavaScript"].map(
                  (technology) => (
                    <span
                      key={technology}
                      className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-500"
                    >
                      {technology}
                    </span>
                  )
                )}

              </div>

            </div>

          </div>

          {/* Sidebar */}
          <aside>

            <button className="mb-2 flex w-full items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">
              ♡ Like project
            </button>

            <a
              href="#"
              className="mb-2 block rounded-md border border-zinc-800 px-4 py-2.5 text-center text-sm text-zinc-500 transition hover:border-zinc-700 hover:text-white"
            >
              View source code ↗
            </a>

            <a
              href="#"
              className="block rounded-md border border-zinc-800 px-4 py-2.5 text-center text-sm text-zinc-500 transition hover:border-zinc-700 hover:text-white"
            >
              Live website ↗
            </a>

          </aside>

        </div>

      </div>
    </main>
  )
}

export default ProjectDetails