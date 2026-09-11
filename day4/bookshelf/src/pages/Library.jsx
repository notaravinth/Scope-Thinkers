import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useBookStore } from "../store/bookStore";

function Library() {
  const user = useAuthStore((state) => state.user);

  const favorites = useBookStore((state) => state.favorites);
  const removeFavorite = useBookStore((state) => state.removeFavorite);

  const [removing, setRemoving] = useState(null);

  const handleRemove = async (bookKey) => {
    setRemoving(bookKey);

    try {
      await removeFavorite(user.uid, bookKey);
    } catch (error) {
      console.error(error);
    }

    setRemoving(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-indigo-400 font-medium mb-2">YOUR COLLECTION</p>

            <h1 className="text-4xl font-bold">My Library</h1>

            <p className="text-slate-500 mt-2">Books you've saved for later.</p>
          </div>

          {favorites.length > 0 && (
            <div className="text-sm text-slate-500">
              {favorites.length} {favorites.length === 1 ? "book" : "books"}
            </div>
          )}
        </div>
      </div>

      {favorites.length === 0 && (
        <div className="text-center py-24 border border-white/10 rounded-2xl bg-slate-900/50">
          <div className="text-6xl mb-5">📚</div>

          <h2 className="text-2xl font-semibold">Your library is empty</h2>

          <p className="text-slate-500 mt-2">
            Discover some books and save your favorites here.
          </p>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((book) => (
            <article
              key={book.key}
              className="group bg-slate-900 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300"
            >
              <div className="relative h-80 bg-slate-800">
                {book.coverId ? (
                  <img
                    src={`https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl">📖</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="font-semibold text-lg leading-snug line-clamp-2">
                  {book.title}
                </h2>

                <p className="text-slate-400 text-sm mt-2 line-clamp-1">
                  {book.author || "Unknown Author"}
                </p>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                  <span className="text-xs text-slate-500">
                    {book.year || "Unknown"}
                  </span>

                  <button
                    onClick={() => handleRemove(book.key)}
                    disabled={removing === book.key}
                    className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50 transition"
                  >
                    {removing === book.key ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Library;
