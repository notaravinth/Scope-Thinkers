function BookCard({ book }) {
  const coverId = book.cover_i;

  return (
    <article className="group bg-slate-900 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300">
      {/* Cover */}

      <div className="relative h-80 bg-slate-800 overflow-hidden">
        {coverId ? (
          <img
            src={`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">📖</div>

              <p className="text-slate-500 text-sm">No cover available</p>
            </div>
          </div>
        )}

        {/* Gradient */}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

      {/* Content */}

      <div className="p-5">
        <h2 className="font-semibold text-lg leading-snug line-clamp-2">
          {book.title}
        </h2>

        <p className="text-slate-400 text-sm mt-2 line-clamp-1">
          {book.author_name?.join(", ") || "Unknown Author"}
        </p>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
          <span className="text-xs text-slate-500">
            {book.first_publish_year || "Unknown"}
          </span>

          <button className="text-sm text-slate-400 hover:text-indigo-400 transition">
            View details →
          </button>
        </div>
      </div>
    </article>
  );
}

export default BookCard;
