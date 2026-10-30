import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import {
  getVehicles,
  addVehicle,
  deleteVehicle,
  getServiceRequests,
  addServiceRequest,
} from "./lib/motiveData";

const palette = {
  aqua: "#77CCA4",
  ivy: "#4B7579",
  mauve: "#605C6C",
  rose: "#AC9C98",
  limestone: "#B2B4B2",
};

const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  car: (
    <>
      <path d="m5 11 1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
      <path d="M3.5 11.5A2.5 2.5 0 0 1 6 9h12a2.5 2.5 0 0 1 2.5 2.5V17h-17z" />
      <path d="M6 17v2m12-2v2M7 13h.01M17 13h.01" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M8 9h8M8 13h8M8 17h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
      <path d="M3 3v5h5m4-1v5l3 2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9a2.5 2.5 0 1 1 4.6 1.4c-.9 1.1-2.2 1.3-2.2 3M12 17h.01" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path
        d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4L7.1 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z"
        transform="translate(-1 -1) scale(1.08)"
      />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4 4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  messages: (
    <>
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      <path d="M8 10h8M8 14h5" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  pin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  wrench: (
    <>
      <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  dots: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  fuel: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M7 7h5M15 8h2l3 3v7a2 2 0 0 1-4 0v-4" />
    </>
  ),
  odometer: (
    <>
      <path d="M4.9 19a9 9 0 1 1 14.2 0" />
      <path d="m12 13 4-4M7 17h.01M12 18h.01M17 17h.01" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name] || icons.grid}
    </svg>
  );
}

const brands = {
  Hyundai: ["Creta", "i20", "Venue", "Verna", "Grand i10 Nios"],
  Honda: ["City", "Amaze", "Elevate", "Jazz"],
  Tata: ["Nexon", "Punch", "Harrier", "Tiago", "Altroz"],
  Toyota: ["Innova Crysta", "Fortuner", "Glanza", "Hyryder"],
  Maruti: ["Swift", "Baleno", "Brezza", "Dzire", "Wagon R"],
  Mahindra: ["Thar", "XUV 3XO", "Scorpio-N", "XUV700"],
  Kia: ["Seltos", "Sonet", "Carens"],
  Volkswagen: ["Virtus", "Taigun", "Polo"],
  BMW: ["3 Series", "5 Series", "X1", "X3"],
  Other: ["Other model"],
};

const navItems = [
  {
    section: "WORKSPACE",
    items: [
      { label: "Overview", icon: "grid" },
      { label: "My vehicles", icon: "car" },
      { label: "Service requests", icon: "clipboard" },
      { label: "Notifications", icon: "bell" },
      { label: "Appointments", icon: "calendar" },
      { label: "Service history", icon: "history" },
    ],
  },
  {
    section: "SUPPORT",
    items: [
      { label: "Help centre", icon: "help" },
      { label: "Settings", icon: "settings" },
    ],
  },
];

function StatusPill({ status }) {
  const classes = {
    "In progress": "bg-[#E5F2EB] text-[#356B57]",
    "Awaiting approval": "bg-[#F3EEE9] text-[#826B5F]",
    Inspection: "bg-[#E7EFF0] text-[#416A6D]",
    Completed: "bg-[#E5F2EB] text-[#356B57]",
    Submitted: "bg-[#F0EFF3] text-[#605C6C]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[status] || classes.Submitted}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

function PriorityPill({ priority }) {
  const classes = {
    High: "text-[#A34F43] bg-[#F8EAE7]",
    Medium: "text-[#806C43] bg-[#F5F0E3]",
    Low: "text-[#4B7579] bg-[#E8F1EF]",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[priority] || classes.Low}`}
    >
      {priority}
    </span>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error("Could not retrieve session:", error.message);
      }

      setSession(data?.session ?? null);
      setAuthLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const [activePage, setActivePage] = useState("Overview");
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [vehicleDeletingId, setVehicleDeletingId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [requestFilter, setRequestFilter] = useState("All requests");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const [vehicles, setVehicles] = useState([]);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    registration: "",
    mileage: "",
    category: "General service",
    description: "",
    location: "Chennai",
    preferredDate: "",
  });
  const [vehicleForm, setVehicleForm] = useState({
    brand: "Hyundai",
    model: "Creta",
    year: "2023",
    fuel: "Petrol",
    transmission: "Automatic",
    reg: "",
    km: "",
  });
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    city: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    const metadata = session?.user?.user_metadata || {};
    setProfileForm({
      fullName: metadata.full_name || "",
      phone: metadata.phone || "",
      city: metadata.city || "",
    });
  }, [session?.user?.id, session?.user?.user_metadata?.full_name,
      session?.user?.user_metadata?.phone, session?.user?.user_metadata?.city]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setNotifications([]);
      return undefined;
    }

    let active = true;
    setNotificationsLoading(true);
    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, type, read_at, created_at, request_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!active) return;
      if (error) {
        // The migration may not have been applied yet; keep the rest of the app usable.
        console.warn("Notifications unavailable:", error.message);
      } else {
        setNotifications(data || []);
      }
      setNotificationsLoading(false);
    };
    loadNotifications();

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setNotifications((current) => [payload.new, ...current.filter((item) => item.id !== payload.new.id)].slice(0, 50));
        } else if (payload.eventType === "UPDATE") {
          setNotifications((current) => current.map((item) => item.id === payload.new.id ? payload.new : item));
        }
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const unreadNotifications = notifications.filter((item) => !item.read_at).length;

  const markNotificationRead = async (notification) => {
    if (notification.read_at) return;
    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item));
    const { error } = await supabase.from("notifications").update({ read_at: readAt }).eq("id", notification.id).eq("user_id", session.user.id);
    if (error) notify("Could not mark notification as read. Apply the notifications SQL setup first.");
  };

  const deleteVehicleFromGarage = async (vehicle) => {
    const confirmed = window.confirm(`Delete ${vehicle.brand} ${vehicle.model} from your garage? This may be blocked if it has service requests.`);
    if (!confirmed) return;
    setVehicleDeletingId(vehicle.id);
    try {
      await deleteVehicle(vehicle.id);
      setVehicles((current) => current.filter((item) => item.id !== vehicle.id));
      if (selectedVehicle === `${vehicle.brand} ${vehicle.model}`) setSelectedVehicle("");
      notify(`${vehicle.brand} ${vehicle.model} removed from your garage`);
    } catch (error) {
      notify(error.message || "Could not delete this vehicle. It may have linked service requests.");
    } finally {
      setVehicleDeletingId(null);
    }
  };

  const filteredRequests = useMemo(
    () =>
      requests.filter((r) => {
        const matchesSearch =
          `${r.id} ${r.title} ${r.car} ${r.reg} ${r.category}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesFilter =
          requestFilter === "All requests" || r.status === requestFilter;
        return matchesSearch && matchesFilter;
      }),
    [requests, search, requestFilter],
  );

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      if (!session?.user?.id) {
        setVehicles([]);
        setRequests([]);
        setDataLoading(false);
        return;
      }

      setDataLoading(true);

      try {
        const [vehicleData, requestData] = await Promise.all([
          getVehicles(),
          getServiceRequests(),
        ]);

        if (!isMounted) return;

        setVehicles(vehicleData);
        setRequests(requestData);
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load dashboard data:", error);
        notify(error.message || "Could not load dashboard data.");
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const openRequest = (vehicleName = selectedVehicle) => {
    const vehicle = vehicles.find(
      (v) => `${v.brand} ${v.model}` === vehicleName,
    );
    setForm((current) => ({
      ...current,
      brand: vehicle?.brand || "",
      model: vehicle?.model || "",
      year: vehicle?.year || "",
      registration: vehicle?.reg || "",
      mileage: vehicle?.km?.replace(",", "") || "",
    }));
    setShowRequestModal(true);
  };

  const submitRequest = async (event) => {
    event.preventDefault();

    // A service request must belong to a vehicle in the garage.
    const vehicle = vehicles.find(
      (v) => v.brand === form.brand && v.model === form.model,
    );

    if (!vehicle) {
      notify("Add this vehicle to your garage before requesting service.");
      return;
    }

    try {
      const savedRequest = await addServiceRequest({
        vehicleId: vehicle.id,
        category: form.category,
        description: form.description,
        location: form.location,
        preferredDate: form.preferredDate,
      });

      // Use the record returned by Supabase.
      setRequests((current) => [savedRequest, ...current]);

      setShowRequestModal(false);
      setActivePage("Service requests");
      setSearch("");
      setRequestFilter("All requests");

      setForm((current) => ({
        ...current,
        description: "",
        category: "General service",
        preferredDate: "",
      }));

      notify("Service request submitted");
    } catch (error) {
      console.error("Failed to submit service request:", error);
      notify(error.message || "Could not submit service request.");
    }
  };

  const submitVehicle = async (event) => {
    event.preventDefault();

    try {
      const savedVehicle = await addVehicle({
        brand: vehicleForm.brand,
        model: vehicleForm.model,
        year: vehicleForm.year,
        fuel: vehicleForm.fuel,
        transmission: vehicleForm.transmission,
        reg: vehicleForm.reg,
        km: vehicleForm.km || "0",
        nickname: "My vehicle",
      });

      // Update the UI with the vehicle returned by Supabase.
      setVehicles((current) => [savedVehicle, ...current]);

      setSelectedVehicle(`${savedVehicle.brand} ${savedVehicle.model}`);
      setShowVehicleModal(false);

      notify("Vehicle added to your garage");
    } catch (error) {
      console.error("Failed to add vehicle:", error);
      notify(error.message || "Could not add vehicle. Please try again.");
    }
  };

  const userName =
    profileForm.fullName.trim() ||
    session?.user?.user_metadata?.full_name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    "there";
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";
  const userEmail = session?.user?.email || "";
  const userCity = profileForm.city.trim() || "Your garage";

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.fullName.trim(),
          phone: profileForm.phone.trim(),
          city: profileForm.city.trim(),
        },
      });
      if (error) throw error;
      if (data?.user) {
        setSession((current) =>
          current ? { ...current, user: data.user } : current,
        );
      }
      notify("Profile updated");
    } catch (error) {
      console.error("Failed to update profile:", error);
      notify(error.message || "Could not update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const pageTitle =
    activePage === "Overview" ? `Good morning, ${userName}` : activePage;
  const pageSubtitle =
    activePage === "Overview"
      ? "Here’s what’s happening with your vehicles."
      : {
          "My vehicles":
            "Manage your vehicles and keep their details up to date.",
          "Service requests":
            "Track every request from first report to final handover.",
          Appointments: "Your upcoming workshop visits, all in one place.",
          "Service history": "A record of the work completed on your vehicles.",
          "Help centre": "Find answers or get in touch with our service team.",
          Settings: "Manage your profile and communication preferences.",
        }[activePage] || "Manage your automotive service experience.";

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8F6] text-sm text-[#4B7579]">
        Loading Motive...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#262E2C]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-[#E8EBE7] bg-white lg:flex">
        <div className="flex h-[82px] items-center gap-3 border-b border-[#EEF0ED] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#4B7579] text-white">
            <Icon name="wrench" size={21} />
          </div>
          <div>
            <div className="text-[16px] font-bold tracking-[-0.04em]">
              motive<span className="text-[#4B7579]">.</span>
            </div>
            <div className="mt-0.5 text-[10px] font-medium tracking-[0.14em] text-[#929B97]">
              VEHICLE CARE
            </div>
          </div>
        </div>

        <div className="px-4 pt-7">
          <button
            onClick={openRequest}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4B7579] text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#3E6568]"
          >
            <Icon name="plus" size={17} /> New service request
          </button>
        </div>

        <nav className="mt-8 flex-1 px-3">
          {navItems.map((group) => (
            <div key={group.section} className="mb-7">
              <div className="mb-3 px-3 text-[10px] font-bold tracking-[0.15em] text-[#A1A8A4]">
                {group.section}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActivePage(item.label)}
                  className={`mb-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] transition ${activePage === item.label ? "bg-[#EAF3EF] font-semibold text-[#3F6D65]" : "text-[#6E7773] hover:bg-[#F7F8F6] hover:text-[#303936]"}`}
                >
                  <Icon name={item.icon} size={18} />
                  <span className="flex-1">{item.label}</span>
                  {item.count && (
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#4B7579]">
                      {requests.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="m-4 rounded-xl bg-[#F4F6F3] p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#4B7579]">
            <Icon name="help" size={17} />
          </div>
          <div className="text-[12px] font-semibold">Need a hand?</div>
          <p className="mt-1 text-[11px] leading-5 text-[#78827D]">
            Our service team is here to help with your vehicle.
          </p>
          <button
            onClick={() => setActivePage("Help centre")}
            className="mt-2 text-[11px] font-semibold text-[#4B7579]"
          >
            Visit help centre <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-[#EEF0ED] px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6E8E2] text-[12px] font-bold text-[#59655E]">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-semibold">
              {userName}
            </div>
            <div className="truncate text-[10px] text-[#8B948F]">
              {userEmail || "Personal account"}
            </div>
          </div>
          <button
            onClick={() => setActivePage("Settings")}
            className="text-[#9BA39F] hover:text-[#4B7579]"
            aria-label="Open settings"
          >
            <Icon name="dots" />
          </button>
        </div>
      </aside>

      <div className="lg:pl-[244px]">
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-[#E8EBE7] bg-white/95 px-5 backdrop-blur md:px-9">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4B7579] text-white">
              <Icon name="wrench" size={18} />
            </div>
            <span className="font-bold tracking-tight">
              motive<span className="text-[#4B7579]">.</span>
            </span>
          </div>

          <div className="relative hidden w-full max-w-[340px] md:block">
            <Icon
              name="search"
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA29E]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests, vehicles..."
              className="h-10 w-full rounded-xl border border-[#E8EBE7] bg-[#FAFBF9] pl-10 pr-4 text-[12px] outline-none transition placeholder:text-[#A1A9A5] focus:border-[#77CCA4] focus:bg-white"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-[11px] font-semibold">{userCity}</div>
              <div className="mt-0.5 text-[10px] text-[#929B97]">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
            </div>
            <div className="mx-1 hidden h-8 w-px bg-[#E8EBE7] sm:block" />
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8EBE7] text-[#6C7772] transition hover:bg-[#F7F8F6]"
              aria-label="Notifications"
              onClick={() => setActivePage("Notifications")}
            >
              <Icon name="bell" size={17} />
              {unreadNotifications > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#A34F43] px-1 text-[9px] font-bold text-white ring-2 ring-white">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}
            </button>
            <button
              onClick={() => setActivePage("Settings")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8E9E3] text-[11px] font-bold text-[#56645D]"
            >
              {userInitials}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-9 md:pt-9">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8B9690]">
                <span>MY GARAGE</span>
                <span className="text-[#C4CBC6]">/</span>
                <span className="text-[#4B7579]">{activePage}</span>
              </div>
              <h1 className="text-[25px] font-semibold tracking-[-0.045em] text-[#29322E] md:text-[29px]">
                {pageTitle}
                {activePage === "Overview" && (
                  <span className="ml-2 inline-block align-middle text-[22px]">
                    ✳
                  </span>
                )}
              </h1>
              <p className="mt-1.5 text-[12px] text-[#858F89]">
                {pageSubtitle}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowVehicleModal(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DDE3DE] bg-white px-3.5 text-[12px] font-semibold text-[#4F5B55] transition hover:border-[#B9C9C1]"
              >
                <Icon name="plus" size={16} /> Add vehicle
              </button>
              <button
                onClick={openRequest}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#4B7579] px-3.5 text-[12px] font-semibold text-white transition hover:bg-[#3E6568]"
              >
                <Icon name="plus" size={16} /> New request
              </button>
            </div>
          </div>

          {activePage === "Overview" && (
            <>
              <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
                <div className="relative min-h-[250px] overflow-hidden rounded-2xl bg-[#E6EFEB] p-6 md:p-7">
                  <div className="relative z-10 max-w-[52%]">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C7DCD1] bg-white/65 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#4B7579]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#77CCA4]" />{" "}
                      YOUR GARAGE
                    </div>
                    <h2 className="mt-4 text-[21px] font-semibold leading-[1.25] tracking-[-0.04em] text-[#2D4540] md:text-[25px]">
                      Good care keeps
                      <br />
                      you moving.
                    </h2>
                    <p className="mt-2 max-w-[230px] text-[11px] leading-5 text-[#6C837A]">
                      Your vehicles, service records and upcoming visits — all
                      in one place.
                    </p>
                    <button
                      onClick={() => setActivePage("My vehicles")}
                      className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold text-[#3E6862]"
                    >
                      Explore my garage <Icon name="arrow" size={15} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 right-[-10px] top-0 w-[59%] overflow-hidden">
                    <div className="absolute right-[-8%] top-[15%] h-[210px] w-[290px] rounded-full bg-[#D3E3DB]" />
                    <img
                      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=85"
                      alt="Silver sports car"
                      className="absolute bottom-[-8px] right-[-50px] h-[205px] w-[360px] max-w-none object-contain object-bottom drop-shadow-[0_18px_15px_rgba(55,77,66,0.18)] md:right-[-25px] md:h-[230px] md:w-[400px]"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#DCE9E2] to-transparent" />
                  </div>
                  <div className="absolute bottom-3 left-7 z-10 text-[9px] font-medium text-[#8AA197]">
                    01 / PERSONAL GARAGE
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8EBE7] bg-white p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-[14px] font-semibold tracking-tight">
                        Service overview
                      </h2>
                      <p className="mt-1 text-[11px] text-[#939C97]">
                        Across your vehicles
                      </p>
                    </div>
                    <button
                      onClick={() => setActivePage("Service requests")}
                      className="text-[11px] font-semibold text-[#4B7579]"
                    >
                      View all <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#F7F8F6] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#7F8983]">
                          Open requests
                        </span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#4B7579]">
                          <Icon name="clipboard" size={15} />
                        </span>
                      </div>
                      <div className="mt-2 text-[27px] font-semibold tracking-[-0.05em]">
                        {requests
                          .filter((r) => r.status !== "Completed")
                          .length.toString()
                          .padStart(2, "0")}
                      </div>
                      <div className="mt-1 text-[10px] text-[#909992]">
                        Need your attention
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#F7F8F6] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#7F8983]">
                          Vehicles
                        </span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#4B7579]">
                          <Icon name="car" size={15} />
                        </span>
                      </div>
                      <div className="mt-2 text-[27px] font-semibold tracking-[-0.05em]">
                        {vehicles.length.toString().padStart(2, "0")}
                      </div>
                      <div className="mt-1 text-[10px] text-[#909992]">
                        In your garage
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#E8EBE7] px-3.5 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F1EF] text-[#4B7579]">
                      <Icon name="calendar" size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold">
                        Next appointment
                      </div>
                      <div className="mt-1 text-[10px] text-[#909992]">
                        No upcoming visits scheduled
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePage("Appointments")}
                      className="text-[#4B7579]"
                    >
                      <Icon name="chevron" size={17} />
                    </button>
                  </div>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-[16px] font-semibold tracking-[-0.025em]">
                      Your vehicles
                    </h2>
                    <p className="mt-1 text-[11px] text-[#8D9791]">
                      Everything you drive, in one place.
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePage("My vehicles")}
                    className="text-[11px] font-semibold text-[#4B7579]"
                  >
                    Manage vehicles <span aria-hidden="true">→</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {vehicles.slice(0, 2).map((vehicle, index) => (
                    <div
                      key={vehicle.id}
                      className="group rounded-2xl border border-[#E6EAE5] bg-white p-4 transition hover:border-[#C9D8D0] sm:p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`relative flex h-[104px] w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-xl ${index % 2 === 0 ? "bg-[#F0F3F0]" : "bg-[#F0EFF3]"}`}
                        >
                          <img
                            src={
                              index % 2 === 0
                                ? "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=500&q=80"
                                : "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=500&q=80"
                            }
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="h-full w-full object-cover mix-blend-multiply"
                          />
                          <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[9px] font-semibold text-[#52615A]">
                            {vehicle.year}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-[15px] font-semibold tracking-[-0.03em]">
                                {vehicle.brand} {vehicle.model}
                              </div>
                              <div className="mt-1 text-[10px] text-[#929B95]">
                                {vehicle.nickname}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                notify(
                                  `${vehicle.brand} ${vehicle.model} selected`,
                                )
                              }
                              className="rounded-lg p-1.5 text-[#9AA39D] hover:bg-[#F5F7F4]"
                              aria-label="Vehicle options"
                            >
                              <Icon name="dots" size={18} />
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-[#727D76]">
                            <span className="inline-flex items-center gap-1">
                              <Icon name="fuel" size={13} />
                              {vehicle.fuel}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Icon name="odometer" size={13} />
                              {vehicle.km} km
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="rounded-md bg-[#F5F6F3] px-2 py-1 text-[9px] font-medium tracking-wide text-[#67736C]">
                              {vehicle.reg}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedVehicle(
                                  `${vehicle.brand} ${vehicle.model}`,
                                );
                                openRequest(
                                  `${vehicle.brand} ${vehicle.model}`,
                                );
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4B7579]"
                            >
                              Request service <Icon name="arrow" size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {vehicles.length > 2 && (
                  <button
                    onClick={() => setActivePage("My vehicles")}
                    className="mt-3 text-[11px] font-semibold text-[#4B7579]"
                  >
                    View all {vehicles.length} vehicles →
                  </button>
                )}
              </section>

              <section className="mt-8">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-[16px] font-semibold tracking-[-0.025em]">
                      Recent service requests
                    </h2>
                    <p className="mt-1 text-[11px] text-[#8D9791]">
                      Updates from your service desk.
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePage("Service requests")}
                    className="text-[11px] font-semibold text-[#4B7579]"
                  >
                    All requests <span aria-hidden="true">→</span>
                  </button>
                </div>
                <RequestTable
                  requests={requests.slice(0, 3)}
                  compact
                  onSelect={(request) =>
                    notify(`${request.id} · ${request.status}`)
                  }
                />
              </section>
            </>
          )}

          {activePage === "My vehicles" && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold">
                    Your garage{" "}
                    <span className="ml-1 text-[12px] font-normal text-[#929B95]">
                      ({vehicles.length})
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#4B7579] px-3 text-[11px] font-semibold text-white"
                >
                  <Icon name="plus" size={15} /> Add vehicle
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {vehicles.map((v, i) => (
                  <div
                    key={v.id}
                    className="rounded-2xl border border-[#E6EAE5] bg-white p-5"
                  >
                    <div className="flex gap-4">
                      <img
                        className="h-28 w-36 rounded-xl object-cover"
                        src={
                          i % 2 === 0
                            ? "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=500&q=80"
                            : "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=500&q=80"
                        }
                        alt={`${v.brand} ${v.model}`}
                      />
                      <div className="flex-1">
                        <div className="text-[16px] font-semibold">
                          {v.brand} {v.model}
                        </div>
                        <div className="mt-1 text-[11px] text-[#89938D]">
                          {v.year} · {v.fuel} · {v.transmission}
                        </div>
                        <div className="mt-3 text-[11px] text-[#606D65]">
                          {v.reg}
                        </div>
                        <div className="mt-1 text-[11px] text-[#606D65]">
                          {v.km} km driven
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex gap-2 border-t border-[#EEF0ED] pt-4">
                      <button
                        onClick={() => {
                          setSelectedVehicle(`${v.brand} ${v.model}`);
                          openRequest(`${v.brand} ${v.model}`);
                        }}
                        className="h-9 flex-1 rounded-lg bg-[#4B7579] text-[11px] font-semibold text-white"
                      >
                        Request service
                      </button>
                      <button
                        onClick={() => deleteVehicleFromGarage(v)}
                        disabled={vehicleDeletingId === v.id}
                        className="h-9 rounded-lg border border-[#E8D8D5] px-3 text-[11px] font-semibold text-[#A34F43] disabled:opacity-50"
                      >
                        {vehicleDeletingId === v.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#C9D5CE] bg-[#FBFCFA] text-[#6F8178] transition hover:bg-[#F3F7F3]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F1EA]">
                    <Icon name="plus" />
                  </span>
                  <span className="mt-3 text-[12px] font-semibold">
                    Add another vehicle
                  </span>
                  <span className="mt-1 text-[10px]">
                    Supports multiple makes and models
                  </span>
                </button>
              </div>
            </section>
          )}

          {activePage === "Service requests" && (
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold">
                    All requests{" "}
                    <span className="ml-1 text-[12px] font-normal text-[#929B95]">
                      ({filteredRequests.length})
                    </span>
                  </h2>
                  <p className="mt-1 text-[11px] text-[#8D9791]">
                    Review status, priority and assigned service advisor.
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={requestFilter}
                    onChange={(e) => setRequestFilter(e.target.value)}
                    className="h-9 rounded-lg border border-[#DFE5DF] bg-white px-3 text-[11px] outline-none focus:border-[#77CCA4]"
                  >
                    <option>All requests</option>
                    <option>Submitted</option>
                    <option>Inspection</option>
                    <option>In progress</option>
                    <option>Awaiting approval</option>
                    <option>Completed</option>
                  </select>
                  <button
                    onClick={openRequest}
                    className="h-9 rounded-lg bg-[#4B7579] px-3 text-[11px] font-semibold text-white"
                  >
                    + New request
                  </button>
                </div>
              </div>
              <RequestTable
                requests={filteredRequests}
                onSelect={(r) => notify(`${r.id}: ${r.title} · ${r.status}`)}
              />
            </section>
          )}

          {activePage === "Appointments" && (
            <section className="rounded-2xl border border-[#E6EAE5] bg-white p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1EF] text-[#4B7579]">
                  <Icon name="calendar" size={22} />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold">
                    No upcoming appointments
                  </h2>
                  <p className="mt-1 max-w-lg text-[12px] leading-6 text-[#89938D]">
                    When you book a service visit, your appointment details and
                    check-in information will appear here.
                  </p>
                  <button
                    onClick={openRequest}
                    className="mt-5 h-10 rounded-xl bg-[#4B7579] px-4 text-[11px] font-semibold text-white"
                  >
                    Request a service visit
                  </button>
                </div>
              </div>
            </section>
          )}

          {activePage === "Service history" && (
            <section>
              <div className="mb-4">
                <h2 className="text-[16px] font-semibold">Service records</h2>
                <p className="mt-1 text-[11px] text-[#8D9791]">
                  Completed work and maintenance history for your vehicles.
                </p>
              </div>
              <div className="space-y-3">
                {vehicles.length === 0 ? (
                  <div className="rounded-2xl border border-[#E6EAE5] bg-white px-5 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F4F0] text-[#4B7579]">
                      <Icon name="history" size={22} />
                    </div>
                    <div className="mt-3 text-[12px] font-semibold">
                      No vehicles in your garage yet
                    </div>
                    <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-[#89938D]">
                      Add a vehicle to start keeping its service information in one place.
                    </p>
                    <button
                      onClick={() => setShowVehicleModal(true)}
                      className="mt-4 h-9 rounded-xl bg-[#4B7579] px-4 text-[11px] font-semibold text-white"
                    >
                      Add a vehicle
                    </button>
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="rounded-2xl border border-[#E6EAE5] bg-white p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0ED] pb-4">
                        <div className="text-[12px] font-semibold">
                          {vehicle.brand} {vehicle.model}
                          <span className="ml-2 text-[10px] font-normal text-[#8D9791]">
                            {vehicle.reg}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#89938D]">
                          {vehicle.year ? `${vehicle.year} model` : "Year not added"}
                        </span>
                      </div>
                      <div className="py-7 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F4F0] text-[#4B7579]">
                          <Icon name="history" size={20} />
                        </div>
                        <div className="mt-3 text-[12px] font-semibold">
                          No completed service records yet
                        </div>
                        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-[#89938D]">
                          Completed service history for this vehicle will appear here when records are available.
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activePage === "Help centre" && (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E6EAE5] bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F1EF] text-[#4B7579]">
                  <Icon name="messages" />
                </div>
                <h2 className="mt-4 text-[15px] font-semibold">
                  Talk to the service team
                </h2>
                <p className="mt-2 text-[12px] leading-5 text-[#89938D]">
                  Need an update or have a question about a repair? Contact your
                  service advisor with your request ID.
                </p>
                <button
                  onClick={() => setActivePage("Service requests")}
                  className="mt-4 text-[11px] font-semibold text-[#4B7579]"
                >
                  View your requests →
                </button>
              </div>
              <div className="rounded-2xl border border-[#E6EAE5] bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EFF3] text-[#605C6C]">
                  <Icon name="clipboard" />
                </div>
                <h2 className="mt-4 text-[15px] font-semibold">
                  How service requests work
                </h2>
                <p className="mt-2 text-[12px] leading-5 text-[#89938D]">
                  Submit an issue, let the team inspect your vehicle, review any
                  estimate, and follow progress through to collection.
                </p>
                <button
                  onClick={openRequest}
                  className="mt-4 text-[11px] font-semibold text-[#4B7579]"
                >
                  Create a request →
                </button>
              </div>
            </section>
          )}

          {activePage === "Notifications" && (
            <section className="max-w-3xl rounded-2xl border border-[#E6EAE5] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold">Notifications</h2>
                  <p className="mt-1 text-[11px] text-[#89938D]">Updates from the Motive service team appear here.</p>
                </div>
                {unreadNotifications > 0 && <button onClick={async () => {
                  const readAt = new Date().toISOString();
                  setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })));
                  const { error } = await supabase.from("notifications").update({ read_at: readAt }).eq("user_id", session.user.id).is("read_at", null);
                  if (error) notify("Could not mark all notifications as read.");
                }} className="text-[11px] font-semibold text-[#4B7579]">Mark all as read</button>}
              </div>
              {notificationsLoading ? <p className="py-10 text-center text-sm text-[#89938D]">Loading notifications…</p> : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3EF] text-[#4B7579]"><Icon name="bell" size={20} /></div>
                  <p className="mt-3 text-sm font-semibold">You’re all caught up</p>
                  <p className="mt-1 text-xs text-[#89938D]">When an administrator updates a service request, you’ll see it here.</p>
                </div>
              ) : <div className="mt-5 divide-y divide-[#EEF0ED]">{notifications.map((item) => (
                <button key={item.id} onClick={() => { markNotificationRead(item); if (item.request_id) setActivePage("Service requests"); }} className={`flex w-full gap-3 rounded-lg px-3 py-4 text-left transition hover:bg-[#FAFBF9] ${!item.read_at ? "bg-[#F6FAF7]" : ""}`}>
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!item.read_at ? "bg-[#4B7579]" : "bg-transparent"}`} />
                  <span className="min-w-0 flex-1"><span className="block text-[12px] font-semibold text-[#303936]">{item.title}</span><span className="mt-1 block text-[12px] leading-5 text-[#6F7973]">{item.message}</span><span className="mt-2 block text-[10px] text-[#929B97]">{new Date(item.created_at).toLocaleString()}</span></span>
                </button>
              ))}</div>}
            </section>
          )}

          {activePage === "Settings" && (
            <section className="max-w-2xl rounded-2xl border border-[#E6EAE5] bg-white p-6">
              <h2 className="text-[15px] font-semibold">Account settings</h2>
              <p className="mt-1 text-[11px] text-[#89938D]">
                Update your account details and review service updates.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-[11px] font-semibold text-[#58645D]">
                  Full name
                  <input
                    value={profileForm.fullName}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    autoComplete="name"
                    placeholder="Add your full name"
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  />
                </label>
                <label className="text-[11px] font-semibold text-[#58645D]">
                  Email address
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="mt-2 h-10 w-full cursor-not-allowed rounded-lg border border-[#DFE5DF] bg-[#F7F8F6] px-3 text-[12px] font-normal outline-none"
                  />
                  <span className="mt-1 block text-[10px] font-normal text-[#89938D]">
                    Email is managed by your sign-in account.
                  </span>
                </label>
                <label className="text-[11px] font-semibold text-[#58645D]">
                  Mobile number
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    autoComplete="tel"
                    placeholder="Add mobile number"
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  />
                </label>
                <label className="text-[11px] font-semibold text-[#58645D]">
                  City
                  <input
                    value={profileForm.city}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    autoComplete="address-level2"
                    placeholder="Add your city"
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  />
                </label>
              </div>
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                className="mt-5 h-10 rounded-xl bg-[#4B7579] px-4 text-[11px] font-semibold text-white transition hover:bg-[#3E6568] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileSaving ? "Saving..." : "Save changes"}
              </button>
            </section>
          )}
        </main>
      </div>
      {showRequestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#202B27]/35 p-4 backdrop-blur-[3px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowRequestModal(false);
          }}
        >
          <div className="my-5 w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(25,42,34,0.22)]">
            <div className="flex items-start justify-between border-b border-[#EEF0ED] px-6 py-5">
              <div>
                <div className="text-[17px] font-semibold tracking-[-0.03em]">
                  New service request
                </div>
                <p className="mt-1 text-[11px] text-[#89938D]">
                  Tell us what your vehicle needs. We’ll take it from here.
                </p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="rounded-lg p-2 text-[#8A948E] hover:bg-[#F5F7F4]"
                aria-label="Close"
              >
                <Icon name="close" />
              </button>
            </div>
            <form
              onSubmit={submitRequest}
              className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5"
            >
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-[#4D5A53]">
                  Vehicle
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.brand}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        brand: e.target.value,
                        model: brands[e.target.value][0],
                      })
                    }
                    className="h-10 rounded-lg border border-[#DFE5DF] bg-white px-3 text-[12px] outline-none focus:border-[#77CCA4]"
                  >
                    {Object.keys(brands).map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                  <select
                    value={form.model}
                    onChange={(e) =>
                      setForm({ ...form, model: e.target.value })
                    }
                    className="h-10 rounded-lg border border-[#DFE5DF] bg-white px-3 text-[12px] outline-none focus:border-[#77CCA4]"
                  >
                    {brands[form.brand].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Year
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] bg-white px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  >
                    {Array.from({ length: 27 }, (_, i) => String(2026 - i)).map(
                      (y) => (
                        <option key={y}>{y}</option>
                      ),
                    )}
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Registration
                  <input
                    value={form.registration}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        registration: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="TN 00 AA 0000"
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  />
                </label>
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Odometer (km)
                  <input
                    value={form.mileage}
                    onChange={(e) =>
                      setForm({ ...form, mileage: e.target.value })
                    }
                    type="number"
                    min="0"
                    placeholder="e.g. 28450"
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  />
                </label>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-[#4D5A53]">
                  What kind of service do you need?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    "General service",
                    "Engine & transmission",
                    "AC & climate",
                    "Suspension & brakes",
                    "Electrical",
                    "Body & tyres",
                  ].map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => setForm({ ...form, category })}
                      className={`min-h-[42px] rounded-lg border px-3 py-2 text-left text-[11px] transition ${form.category === category ? "border-[#77CCA4] bg-[#EAF4EE] font-semibold text-[#3E6C5E]" : "border-[#E2E7E2] text-[#68746D] hover:border-[#C7D6CD]"}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-[#4D5A53]">
                  Describe the issue
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="What are you noticing? When did it start? Any sounds, warning lights or other symptoms?"
                  className="w-full resize-y rounded-lg border border-[#DFE5DF] px-3 py-2.5 text-[12px] leading-5 outline-none placeholder:text-[#A4ACA7] focus:border-[#77CCA4]"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Preferred service date{" "}
                  <input
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) =>
                      setForm({ ...form, preferredDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] bg-white px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  />
                </label>
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Service location{" "}
                  <input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  />
                </label>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-[#F5F7F4] p-3 text-[10px] leading-4 text-[#77837B]">
                <Icon
                  name="spark"
                  size={17}
                  className="shrink-0 text-[#4B7579]"
                />
                Your request will be reviewed by a service advisor. Any
                diagnosis or estimate will be confirmed after inspection.
              </div>
              <div className="flex justify-end gap-2 border-t border-[#EEF0ED] pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="h-10 rounded-lg border border-[#DFE5DF] px-4 text-[11px] font-semibold text-[#5E6A63]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4B7579] px-4 text-[11px] font-semibold text-white transition hover:bg-[#3E6568]"
                >
                  Submit request <Icon name="arrow" size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVehicleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#202B27]/35 p-4 backdrop-blur-[3px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowVehicleModal(false);
          }}
        >
          <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(25,42,34,0.22)]">
            <div className="flex items-start justify-between border-b border-[#EEF0ED] px-6 py-5">
              <div>
                <div className="text-[17px] font-semibold tracking-[-0.03em]">
                  Add a vehicle
                </div>
                <p className="mt-1 text-[11px] text-[#89938D]">
                  Add your car to make future service requests quicker.
                </p>
              </div>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="rounded-lg p-2 text-[#8A948E] hover:bg-[#F5F7F4]"
                aria-label="Close"
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={submitVehicle} className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Make / brand
                  <select
                    value={vehicleForm.brand}
                    onChange={(e) =>
                      setVehicleForm({
                        ...vehicleForm,
                        brand: e.target.value,
                        model: brands[e.target.value][0],
                      })
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] bg-white px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  >
                    {Object.keys(brands).map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Model
                  <select
                    value={vehicleForm.model}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, model: e.target.value })
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] bg-white px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  >
                    {brands[vehicleForm.brand].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Year
                  <select
                    value={vehicleForm.year}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, year: e.target.value })
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] bg-white px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  >
                    {Array.from({ length: 27 }, (_, i) => String(2026 - i)).map(
                      (y) => (
                        <option key={y}>{y}</option>
                      ),
                    )}
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Fuel type
                  <select
                    value={vehicleForm.fuel}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, fuel: e.target.value })
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] bg-white px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>CNG</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Transmission
                  <select
                    value={vehicleForm.transmission}
                    onChange={(e) =>
                      setVehicleForm({
                        ...vehicleForm,
                        transmission: e.target.value,
                      })
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] bg-white px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  >
                    <option>Manual</option>
                    <option>Automatic</option>
                    <option>CVT</option>
                    <option>DCT</option>
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-[#4D5A53]">
                  Odometer (km)
                  <input
                    value={vehicleForm.km}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, km: e.target.value })
                    }
                    type="number"
                    min="0"
                    placeholder="e.g. 28450"
                    className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                  />
                </label>
              </div>
              <label className="block text-[11px] font-semibold text-[#4D5A53]">
                Registration number
                <input
                  value={vehicleForm.reg}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      reg: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="TN 00 AA 0000"
                  className="mt-2 h-10 w-full rounded-lg border border-[#DFE5DF] px-3 text-[12px] font-normal outline-none focus:border-[#77CCA4]"
                />
              </label>
              <div className="flex justify-end gap-2 border-t border-[#EEF0ED] pt-4">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="h-10 rounded-lg border border-[#DFE5DF] px-4 text-[11px] font-semibold text-[#5E6A63]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-[#4B7579] px-4 text-[11px] font-semibold text-white"
                >
                  Add vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-xl bg-[#344E46] px-4 py-3 text-[12px] font-medium text-white shadow-xl">
          <Icon name="check" size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

function RequestTable({ requests, compact = false, onSelect }) {
  if (!requests.length)
    return (
      <div className="rounded-2xl border border-[#E6EAE5] bg-white px-6 py-14 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F0F4F0] text-[#4B7579]">
          <Icon name="search" size={20} />
        </div>
        <div className="mt-3 text-[12px] font-semibold">
          No matching requests
        </div>
        <p className="mt-1 text-[11px] text-[#89938D]">
          Try a different search or filter.
        </p>
      </div>
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E6EAE5] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#EEF0ED] bg-[#FBFCFA] text-[9px] font-bold uppercase tracking-[0.1em] text-[#9AA39D]">
              <th className="px-5 py-3.5">Request</th>
              <th className="px-4 py-3.5">Vehicle</th>
              <th className="px-4 py-3.5">Priority</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Last update</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr
                key={r.id}
                onClick={() => onSelect?.(r)}
                className="cursor-pointer border-b border-[#F0F2EF] last:border-0 transition hover:bg-[#FBFCFA]"
              >
                <td className="px-5 py-4">
                  <div className="text-[10px] font-semibold text-[#4B7579]">
                    {r.id}
                  </div>
                  <div className="mt-1 max-w-[220px] truncate text-[12px] font-semibold text-[#37423C]">
                    {r.title}
                  </div>
                  <div className="mt-1 text-[10px] text-[#929B95]">
                    {r.category}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-[11px] font-semibold text-[#4A554E]">
                    {r.car}
                  </div>
                  <div className="mt-1 text-[10px] text-[#929B95]">{r.reg}</div>
                </td>
                <td className="px-4 py-4">
                  <PriorityPill priority={r.priority} />
                </td>
                <td className="px-4 py-4">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="text-[10px] text-[#68746D]">{r.date}</div>
                  {!compact && (
                    <div className="mt-1 text-[10px] text-[#9AA39D]">
                      {r.advisor}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(r);
                    }}
                    className="rounded-lg p-1.5 text-[#9AA39D] hover:bg-[#F0F4F0] hover:text-[#4B7579]"
                    aria-label={`View ${r.id}`}
                  >
                    <Icon name="chevron" size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[#EEF0ED] px-5 py-3">
        <span className="text-[10px] text-[#98A19B]">
          Showing {requests.length} request{requests.length === 1 ? "" : "s"}
        </span>
        <span className="text-[10px] text-[#98A19B]">Updated just now</span>
      </div>
    </div>
  );
}

export default App;
