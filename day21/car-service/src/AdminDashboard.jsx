import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
  submitted: "bg-[#F0EFF3] text-[#605C6C]",
  under_review: "bg-[#E7EFF0] text-[#416A6D]",
  approved: "bg-[#E5F2EB] text-[#356B57]",
  in_progress: "bg-[#E7EFF0] text-[#416A6D]",
  completed: "bg-[#E5F2EB] text-[#356B57]",
  cancelled: "bg-[#F8EAE7] text-[#A34F43]",
};

function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not scheduled"
    : date.toLocaleString();
}

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    let active = true;

    async function readSession() {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setSession(data?.session ?? null);
      setAuthLoading(false);
    }

    readSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
      setError("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAdminData() {
      if (!session?.user?.id) {
        setRequests([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setNotice("");

      try {
        const { data: role, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (roleError) throw roleError;
        if (role?.role !== "admin") {
          throw new Error(
            "Access denied. This account does not have the admin role.",
          );
        }

        const { data, error: requestError } = await supabase
          .from("service_requests")
          .select(`
            id,
            user_id,
            vehicle_id,
            issue_type,
            description,
            location,
            status,
            appointment_at,
            estimated_cost,
            created_at,
            vehicles (
              brand,
              model,
              registration_number
            )
          `)
          .order("created_at", { ascending: false });

        if (requestError) throw requestError;
        if (!active) return;

        const rows = data || [];
        setRequests(rows);
        setDrafts(
          Object.fromEntries(
            rows.map((request) => [
              request.id,
              {
                status: request.status,
                estimatedCost:
                  request.estimated_cost == null
                    ? ""
                    : String(request.estimated_cost),
                appointmentAt: toLocalDateTime(request.appointment_at),
              },
            ]),
          ),
        );
      } catch (loadError) {
        if (active) {
          console.error("Admin dashboard load failed:", loadError);
          setError(loadError.message || "Could not load admin data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAdminData();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const vehicle = request.vehicles;
      const vehicleName = `${vehicle?.brand || ""} ${vehicle?.model || ""}`;
      const searchable = [
        request.id,
        request.user_id,
        request.issue_type,
        request.description,
        request.location,
        vehicleName,
        vehicle?.registration_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(search.toLowerCase()) &&
        (filter === "all" || request.status === filter)
      );
    });
  }, [requests, search, filter]);

  const stats = [
    {
      label: "Total requests",
      value: requests.length,
      color: "#605C6C",
    },
    {
      label: "Awaiting review",
      value: requests.filter(
        (request) =>
          request.status === "submitted" ||
          request.status === "under_review",
      ).length,
      color: "#806C43",
    },
    {
      label: "In progress",
      value: requests.filter((request) => request.status === "in_progress")
        .length,
      color: "#416A6D",
    },
    {
      label: "Completed",
      value: requests.filter((request) => request.status === "completed")
        .length,
      color: "#356B57",
    },
  ];

  function updateDraft(id, key, value) {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], [key]: value },
    }));
  }

  async function saveRequest(request) {
    const draft = drafts[request.id];
    if (!draft) return;

    const parsedCost =
      draft.estimatedCost.trim() === "" ? null : Number(draft.estimatedCost);

    if (
      parsedCost !== null &&
      (!Number.isFinite(parsedCost) || parsedCost < 0)
    ) {
      setError("Estimated cost must be a valid non-negative number.");
      return;
    }

    const appointmentAt = draft.appointmentAt
      ? new Date(draft.appointmentAt).toISOString()
      : null;

    setSavingId(request.id);
    setError("");
    setNotice("");

    try {
      const { data, error: updateError } = await supabase
        .from("service_requests")
        .update({
          status: draft.status,
          estimated_cost: parsedCost,
          appointment_at: appointmentAt,
        })
        .eq("id", request.id)
        .select(`
          id,
          user_id,
          vehicle_id,
          issue_type,
          description,
          location,
          status,
          appointment_at,
          estimated_cost,
          created_at,
          vehicles (
            brand,
            model,
            registration_number
          )
        `)
        .single();

      if (updateError) throw updateError;

      setRequests((current) =>
        current.map((item) => (item.id === request.id ? data : item)),
      );
      setDrafts((current) => ({
        ...current,
        [request.id]: {
          status: data.status,
          estimatedCost:
            data.estimated_cost == null ? "" : String(data.estimated_cost),
          appointmentAt: toLocalDateTime(data.appointment_at),
        },
      }));
      setNotice("Service request updated.");
    } catch (saveError) {
      console.error("Admin request update failed:", saveError);
      setError(
        saveError.message ||
          "Could not update this request. Check the Supabase admin policies.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleSignOut() {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    else window.location.href = "/";
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F7F5] text-sm text-[#7D8580]">
        Checking your session...
      </main>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#F6F7F5] text-[#292D2B]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#E3E6E2] bg-white p-6 md:flex md:flex-col">
        <a href="/admin" className="text-2xl font-bold tracking-tight">
          motive<span className="text-[#77CCA4]">.</span>
        </a>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#8A918C]">
          Administration
        </p>

        <div className="mt-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8A918C]">
            Workspace
          </p>
          <div className="flex items-center gap-3 rounded-xl bg-[#EAF5EF] px-4 py-3 text-sm font-semibold text-[#356B57]">
            <span aria-hidden="true">▦</span>
            Service requests
          </div>
        </div>

        <div className="mt-auto border-t border-[#E3E6E2] pt-5">
          <p className="truncate text-sm font-medium">
            {session.user.email || "Administrator"}
          </p>
          <p className="mt-1 text-xs text-[#8A918C]">Admin portal</p>
          <a
            href="/"
            className="mt-4 block rounded-xl border border-[#E3E6E2] px-4 py-2.5 text-center text-sm hover:bg-[#F6F7F5]"
          >
            Customer dashboard
          </a>
          <button
            onClick={handleSignOut}
            className="mt-2 w-full rounded-xl border border-[#E3E6E2] px-4 py-2.5 text-sm hover:bg-[#F6F7F5]"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="mx-auto max-w-7xl px-5 py-8 md:ml-64 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#7D8580]">Motive / Administration</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Service overview
            </h1>
            <p className="mt-2 text-sm text-[#7D8580]">
              Review requests and manage service status, estimates, and appointments.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-[#DCE1DC] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[#F6F7F5]"
          >
            Refresh data
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-[#E9C8C2] bg-[#F8EAE7] p-4 text-sm text-[#923F35]"
          >
            {error}
          </div>
        )}
        {notice && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-[#B9DDC9] bg-[#EAF5EF] p-4 text-sm text-[#356B57]"
          >
            {notice}
          </div>
        )}

        {loading ? (
          <div className="mt-10 text-sm text-[#7D8580]">
            Loading service requests...
          </div>
        ) : !error ? (
          <>
            <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#E3E6E2] bg-white p-5"
                >
                  <p className="text-sm text-[#7D8580]">{stat.label}</p>
                  <p
                    className="mt-3 text-3xl font-semibold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-[#E3E6E2] bg-white">
              <div className="flex flex-col gap-4 border-b border-[#E3E6E2] p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">All service requests</h2>
                  <p className="mt-1 text-sm text-[#7D8580]">
                    {filteredRequests.length} requests displayed
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search vehicle, issue, or customer ID"
                    className="min-w-0 rounded-xl border border-[#DCE1DC] px-4 py-2.5 text-sm outline-none focus:border-[#77CCA4] sm:w-72"
                  />
                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="rounded-xl border border-[#DCE1DC] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#77CCA4]"
                  >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="font-medium">No service requests found</p>
                  <p className="mt-2 text-sm text-[#7D8580]">
                    Try changing the search or status filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left text-sm">
                    <thead className="bg-[#F8F9F7] text-xs uppercase tracking-wider text-[#7D8580]">
                      <tr>
                        <th className="px-5 py-4 font-medium">Vehicle / customer</th>
                        <th className="px-5 py-4 font-medium">Request</th>
                        <th className="px-5 py-4 font-medium">Submitted</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 font-medium">Estimate (₹)</th>
                        <th className="px-5 py-4 font-medium">Appointment</th>
                        <th className="px-5 py-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9ECE8]">
                      {filteredRequests.map((request) => {
                        const draft = drafts[request.id] || {
                          status: request.status,
                          estimatedCost: request.estimated_cost ?? "",
                          appointmentAt: toLocalDateTime(request.appointment_at),
                        };
                        const vehicle = request.vehicles;

                        return (
                          <tr key={request.id} className="align-top hover:bg-[#FAFBF9]">
                            <td className="px-5 py-4">
                              <p className="font-medium">
                                {vehicle
                                  ? `${vehicle.brand} ${vehicle.model}`
                                  : "Vehicle"}
                              </p>
                              <p className="mt-1 text-xs text-[#7D8580]">
                                {vehicle?.registration_number || "No registration"}
                              </p>
                              <p className="mt-2 max-w-[190px] break-all text-[11px] text-[#8A918C]">
                                Customer ID: {request.user_id}
                              </p>
                            </td>
                            <td className="max-w-xs px-5 py-4">
                              <p className="font-medium">{request.issue_type}</p>
                              <p className="mt-1 whitespace-normal text-xs leading-5 text-[#7D8580]">
                                {request.description || "No description"}
                              </p>
                              {request.location && (
                                <p className="mt-2 text-xs text-[#7D8580]">
                                  Location: {request.location}
                                </p>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-[#626A64]">
                              {formatDate(request.created_at)}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`mb-2 inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                                  STATUS_STYLES[draft.status] || STATUS_STYLES.submitted
                                }`}
                              >
                                {STATUS_OPTIONS.find((item) => item.value === draft.status)?.label || draft.status}
                              </span>
                              <select
                                aria-label={`Status for request ${request.id}`}
                                value={draft.status}
                                onChange={(event) =>
                                  updateDraft(request.id, "status", event.target.value)
                                }
                                className="block w-40 rounded-lg border border-[#DCE1DC] bg-white px-2 py-2 text-xs"
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-4">
                              <input
                                aria-label={`Estimated cost for request ${request.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.estimatedCost}
                                onChange={(event) =>
                                  updateDraft(request.id, "estimatedCost", event.target.value)
                                }
                                placeholder="Not set"
                                className="w-28 rounded-lg border border-[#DCE1DC] px-2 py-2 text-sm"
                              />
                            </td>
                            <td className="px-5 py-4">
                              <input
                                aria-label={`Appointment for request ${request.id}`}
                                type="datetime-local"
                                value={draft.appointmentAt}
                                onChange={(event) =>
                                  updateDraft(request.id, "appointmentAt", event.target.value)
                                }
                                className="w-52 rounded-lg border border-[#DCE1DC] px-2 py-2 text-xs"
                              />
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => saveRequest(request)}
                                disabled={savingId === request.id}
                                className="rounded-xl bg-[#4B7579] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3E6568] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {savingId === request.id ? "Saving..." : "Save changes"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
