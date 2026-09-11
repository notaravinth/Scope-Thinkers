import { useEffect, useState } from "react";

function BookDetails({ book, onClose }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`https://openlibrary.org${book.key}.json`);

        if (!response.ok) {
          throw new Error("Failed to fetch book details");
        }

        const data = await response.json();

        let descriptionText = data.description;

        if (typeof descriptionText === "object") {
          descriptionText = descriptionText.value;
        }

        setDescription(descriptionText || "No description available.");
      } catch (error) {
        console.error(error);
        setDescription("Unable to load description.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [book.key]);

  const coverId = book.cover_i;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-3xl shadow-2xl">
        {/* Close */}

        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-[240px_1fr] gap-8 p-8">
          {/* Cover */}

          <div className="h-96 bg-slate-800 rounded-2xl overflow-hidden">
            {coverId ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl">📖</span>
              </div>
            )}
          </div>

          {/* Details */}

          <div>
            <p className="text-indigo-400 text-sm font-medium mb-3">
              BOOK DETAILS
            </p>

            <h2 className="text-3xl font-bold leading-tight pr-10">
              {book.title}
            </h2>

            <p className="text-slate-400 mt-3">
              {book.author_name?.join(", ") || "Unknown Author"}
            </p>

            {/* Metadata */}

            <div className="flex flex-wrap gap-3 mt-6">
              {book.first_publish_year && (
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-sm text-slate-400">
                  Published {book.first_publish_year}
                </span>
              )}

              {book.edition_count && (
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-sm text-slate-400">
                  {book.edition_count} editions
                </span>
              )}
            </div>

            {/* Description */}

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Description</h3>

              {loading ? (
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
                  Loading description...
                </div>
              ) : (
                <p className="text-slate-400 leading-7">{description}</p>
              )}
            </div>

            {/* Subjects */}

            {book.subject && book.subject.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-slate-300 mb-3">
                  Subjects
                </h3>

                <div className="flex flex-wrap gap-2">
                  {book.subject.slice(0, 8).map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/10"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
