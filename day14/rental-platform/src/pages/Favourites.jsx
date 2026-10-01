import { useFavorites } from "../context/FavouritesContext";
import PropertyCard from "../components/PropertyCard";

const Favorites = () => {
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Your Favorites
          </h1>

          <p className="mt-3 text-slate-500">
            Properties you've saved for later.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="mt-12 rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <div className="text-5xl">♡</div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No favorites yet
            </h2>

            <p className="mt-2 text-slate-500">
              Start saving properties you like and they'll appear here.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;