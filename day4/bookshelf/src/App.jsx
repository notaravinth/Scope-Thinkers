import { useEffect, useState } from "react";
import { useBookStore } from "./store/bookStore";
import BookCard from "./components/BookCard";

function App() {
  const [search, setSearch] = useState("");

  const books = useBookStore((state) => state.books);
  const loading = useBookStore((state) => state.loading);
  const error = useBookStore((state) => state.error);
  const favorites = useBookStore((state) => state.favorites);
  const fetchBooks = useBookStore((state) => state.fetchBooks);

  useEffect(() => {
    fetchBooks("javascript");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) {
      return;
    }

    fetchBooks(search);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}

      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl">
              📚
            </div>

            <div>
              <h1 className="font-bold text-lg">BookShelf</h1>

              <p className="text-xs text-slate-500">Discover your next read</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-full px-4 py-2">
            <span className="text-red-400">♥</span>

            <span className="text-sm text-slate-300">{favorites.length}</span>

            <span className="hidden sm:block text-sm text-slate-500">
              Favorites
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}

      <main className="max-w-7xl mx-auto px-6">
        <section className="pt-20 pb-16">
          <div className="max-w-3xl">
            <p className="text-indigo-400 font-medium mb-4">
              YOUR DIGITAL LIBRARY
            </p>

            <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Discover books
              <span className="text-indigo-500"> you'll love.</span>
            </h2>

            <p className="mt-6 text-lg text-slate-400 max-w-2xl">
              Search millions of books, discover new authors, and build your
              personal reading collection.
            </p>
          </div>

          {/* Search */}

          <form onSubmit={handleSearch} className="mt-10 max-w-2xl">
            <div className="flex items-center bg-slate-900 border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500 transition">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, authors, topics..."
                className="flex-1 bg-transparent px-4 py-3 outline-none text-white placeholder:text-slate-600"
              />

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 transition px-6 py-3 rounded-xl font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Results Header */}

        <section className="pb-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold">Discover</h3>

              <p className="text-slate-500 mt-1">
                Explore books based on your search
              </p>
            </div>

            {!loading && books.length > 0 && (
              <span className="text-sm text-slate-500">
                {books.length} results
              </span>
            )}
          </div>

          {/* Loading */}

          {loading && (
            <div className="flex justify-center py-20">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />

                <span>Finding books...</span>
              </div>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-red-400">
              {error}
            </div>
          )}

          {/* Empty */}

          {!loading && !error && books.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📖</div>

              <h3 className="text-xl font-semibold">No books found</h3>

              <p className="text-slate-500 mt-2">
                Try searching for something else.
              </p>
            </div>
          )}

          {/* Books */}

          {!loading && books.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.key} book={book} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
