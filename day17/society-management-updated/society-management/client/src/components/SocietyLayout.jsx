import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useSocietyAuthStore from "../store/societyAuthStore";
import { ROLE_LABELS, ROLE_NAV, hasRole } from "../config/rolePermissions";

const navItems = [
  { to: "/dashboard", label: "Home", icon: "⌂", roles: ROLE_NAV.dashboard },
  { to: "/complaints", label: "Complaints", icon: "!", roles: ROLE_NAV.complaints },
  { to: "/visitors", label: "Visitors", icon: "↗", roles: ROLE_NAV.visitors },
  { to: "/announcements", label: "Noticeboard", icon: "✦", roles: ROLE_NAV.announcements },
  { to: "/payments", label: "Payments", icon: "₹", roles: ROLE_NAV.payments },
  { to: "/properties", label: "Homes", icon: "▦", roles: ROLE_NAV.properties },
  { to: "/users", label: "People", icon: "◎", roles: ROLE_NAV.users, manager: true },
];

const SocietyLayout = () => {
  const { societyUser, logout } = useSocietyAuthStore();
  const navigate = useNavigate();
  const role = societyUser?.role;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const visibleNavItems = navItems.filter((item) => hasRole(role, item.roles));

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
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
            >
              <span className="side-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.manager && <span className="manager-pill">MANAGE</span>}
            </NavLink>
          ))}
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
          <div className="avatar avatar-small">
            {societyUser?.name?.slice(0, 1)?.toUpperCase()}
          </div>
          <div className="profile-copy">
            <strong>{societyUser?.name}</strong>
            <span>{ROLE_LABELS[role] || role}</span>
          </div>
          <button onClick={handleLogout} className="logout-dot" title="Log out">
            ↗
          </button>
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
