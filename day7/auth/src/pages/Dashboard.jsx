function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-slate-400 mt-3">
          You are authenticated.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;