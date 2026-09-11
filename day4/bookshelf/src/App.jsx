import { useAuthStore } from './store/authStore'

function App() {

    const user = useAuthStore((state) => state.user)
    const loading = useAuthStore((state) => state.loading)

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                Loading...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

            <div className="text-center">

                <h1 className="text-4xl font-bold">
                    BookShelf
                </h1>

                <p className="mt-4 text-slate-400">
                    {user
                        ? `Logged in as ${user.email}`
                        : 'Not logged in'
                    }
                </p>

            </div>

        </div>
    )
}

export default App