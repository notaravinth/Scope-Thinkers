import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useSocietyAuthStore from "../store/societyAuthStore";

const navItems = [
  { to: "/dashboard", label: "Home", icon: "⌂" },
  { to: "/complaints", label: "Complaints", icon: "!" },
  { to: "/visitors", label: "Visitors", icon: "↗" },
  { to: "/announcements", label: "Noticeboard", icon: "✦" },
  { to: "/payments", label: "Payments", icon: "₹" },
  { to: "/properties", label: "Homes", icon: "▦" },
];

const roleCopy = {
  resident: "Resident",
  owner: "Property owner",
  committee: "Committee",
  security: "Security",
  manager: "Society manager",
};

const SocietyLayout = () => {
  const { societyUser, logout } = useSocietyAuthStore();
  const navigate = useNavigate();
  const isManager = societyUser?.role === "manager";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <aside className="society-sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><span>NH</span></div>
          <div>
            <p className="brand-name">Nest<span>Hub</span></p>
            <p className="brand-caption">Maple Grove Society</p>
          </div>
        </div>

        <div className="sidebar-section-label">Your space</div>
        <nav className="side-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
            >
              <span className="side-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isManager && (
            <NavLink
              to="/users"
              className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
            >
              <span className="side-icon">◎</span>
              <span>People</span>
              <span className="manager-pill">MANAGE</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-weather">
          <div className="sun-orbit"><span>☀</span></div>
          <div>
            <p>Community is better together.</p>
            <span>Keep your neighbours in the loop.</span>
          </div>
        </div>

        <div className="profile-mini">
          <div className="avatar avatar-small">{societyUser?.name?.slice(0, 1)?.toUpperCase()}</div>
          <div className="profile-copy">
            <strong>{societyUser?.name}</strong>
            <span>{roleCopy[societyUser?.role] || societyUser?.role}</span>
          </div>
          <button onClick={handleLogout} className="logout-dot" title="Log out">↗</button>
        </div>
      </aside>

      <main className="main-stage">
        <header className="topbar">
          <div className="breadcrumb"><span>MAPLE GROVE</span><b>/</b><span>2026</span></div>
          <div className="topbar-right">
            <div className="live-dot"><i /> Live community</div>
            <div className="top-avatar">{societyUser?.name?.slice(0, 1)?.toUpperCase()}</div>
          </div>
        </header>
        <div className="page-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SocietyLayout;
