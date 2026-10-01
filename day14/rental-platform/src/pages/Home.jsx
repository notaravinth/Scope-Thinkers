import { useProperties } from "../context/PropertyContext";
import PropertyCard from "../components/PropertyCard";

const Home = () => {
  const { properties, loading, error } = useProperties();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-500">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl bg-red-50 px-6 py-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Find your next home
          </h1>

          <p className="mt-3 text-slate-500">
            Explore properties available for rent.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-slate-400">
          Powered by{" "}
          <a
            href="https://untera.io"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Untera
          </a>
        </p>
      </main>
    </div>
  );
};

export default Home;
