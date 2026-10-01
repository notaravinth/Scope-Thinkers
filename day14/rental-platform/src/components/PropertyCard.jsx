import { useFavorites } from "../context/FavouritesContext";

const PropertyCard = ({ property }) => {
  const {
    toggleFavorite,
    isFavorite,
  } = useFavorites();

  const favorite = isFavorite(property.id);

  const formatPrice = (price) => {
    if (!price) {
      return "Price unavailable";
    }

    if (typeof price === "string") {
      return price.startsWith("$")
        ? price
        : `$${price}`;
    }

    return `$${Number(price).toLocaleString()}`;
  };

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-slate-100">
        {property.image ? (
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No image available
          </div>
        )}

        {/* Property Type */}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur">
          {property.type}
        </span>

        {/* Favorite */}
        <button
          type="button"
          onClick={() => toggleFavorite(property)}
          aria-label={
            favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-sm backdrop-blur transition hover:scale-110 ${
            favorite
              ? "text-red-500"
              : "text-slate-700"
          }`}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      {/* Details */}
      <div className="p-5">
        <h2 className="line-clamp-1 text-lg font-semibold text-slate-900">
          {property.title}
        </h2>

        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
          {property.address}
        </p>

        {/* Beds / Baths */}
        <div className="mt-5 flex items-center gap-5 text-sm text-slate-500">
          {property.bedrooms !== null &&
            property.bedrooms !== undefined && (
              <span>
                🛏️ {property.bedrooms} beds
              </span>
            )}

          {property.bathrooms !== null &&
            property.bathrooms !== undefined && (
              <span>
                🚿 {property.bathrooms} baths
              </span>
            )}
        </div>

        {/* Price */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(property.price)}
            </span>

            {property.price && (
              <span className="ml-1 text-sm text-slate-400">
                / month
              </span>
            )}
          </div>

          <button
            type="button"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;