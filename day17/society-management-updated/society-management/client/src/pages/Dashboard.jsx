import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import useSocietyAuthStore from "../store/societyAuthStore";
import StatCard from "../components/StatCard";
import { ROLE_LABELS } from "../config/rolePermissions";

const Dashboard = () => {
  const { societyUser } = useSocietyAuthStore();
  const [stats, setStats] = useState({
    complaints: 0,
    visitors: 0,
    announcements: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!societyUser?.role) return;

      const role = societyUser.role;
      const requests = [
        ["announcements", apiFetch("/society-announcements")],
      ];

      if (["resident", "owner", "committee", "manager"].includes(role)) {
        requests.push(["complaints", apiFetch("/society-complaints")]);
      }

      if (["resident", "owner", "security", "manager"].includes(role)) {
        requests.push(["visitors", apiFetch("/society-visitors")]);
      }

      if (["resident", "owner", "manager"].includes(role)) {
        requests.push(["payments", apiFetch("/society-payments")]);
      }

      try {
        const results = await Promise.all(requests.map(([, request]) => request));
        const values = Object.fromEntries(
          results.map((result, index) => [requests[index][0], result])
        );

        setStats({
          complaints: values.complaints?.complaints?.length || 0,
          visitors: values.visitors?.visitors?.length || 0,
          announcements: values.announcements?.announcements?.length || 0,
          payments:
            values.payments?.payments?.filter((payment) => payment.status !== "paid")
              .length || 0,
        });
      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [societyUser?.role]);

  const firstName = societyUser?.name?.split(" ")[0] || "there";
  const roleLabel = ROLE_LABELS[societyUser?.role] || societyUser?.role;
  const quickAction = ["resident", "owner"].includes(societyUser?.role)
    ? { to: "/complaints", label: "Report an issue" }
    : societyUser?.role === "security"
      ? { to: "/visitors", label: "View visitors" }
      : { to: "/announcements", label: "View noticeboard" };

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="dashboard-page page-enter">
      <section className="hero-card">
        <div className="hero-copy">
          <div className="hero-kicker"><span /> {today.toUpperCase()}</div>
          <h1>Good morning,<br /><em>{firstName}.</em></h1>
          <p>
            Here’s the little picture of life around Maple Grove. Everything you
            need, without the paperwork.
          </p>
          <div className="hero-actions">
            <Link to={quickAction.to} className="button button-dark">
              {quickAction.label} <span>↗</span>
            </Link>
            <Link to="/announcements" className="text-link">
              Read the noticeboard <span>→</span>
            </Link>
          </div>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="sun-disc" />
          <div className="house house-back"><i /><i /><i /></div>
          <div className="house house-front"><i /><i /><i /><i /></div>
          <div className="tree tree-one"><b /><span /></div>
          <div className="tree tree-two"><b /><span /></div>
          <div className="ground-line" />
          <span className="hero-spark spark-a">✦</span>
          <span className="hero-spark spark-b">·</span>
        </div>
      </section>

      <div className="section-heading dashboard-heading">
        <div>
          <span className="eyebrow">Your snapshot</span>
          <h2>What’s happening</h2>
        </div>
        <span className="updated-note">Updated just now</span>
      </div>

      <section className="stats-grid">
        <StatCard label="Open complaints" value={loading ? "—" : stats.complaints} hint="Issues visible to you" tone="coral" icon="!" />
        <StatCard label="Visitors" value={loading ? "—" : stats.visitors} hint="Recent gate activity" tone="blue" icon="↗" />
        <StatCard label="Noticeboard" value={loading ? "—" : stats.announcements} hint="Community updates" tone="lime" icon="✦" />
        <StatCard label="Bills to watch" value={loading ? "—" : stats.payments} hint="Not marked as paid" tone="lavender" icon="₹" />
      </section>

      <section className="dashboard-lower">
        <div className="feature-panel">
          <div className="feature-art"><span>03</span><small>WAYS TO<br />HELP OUT</small></div>
          <div className="feature-copy">
            <span className="eyebrow">Neighbourhood note</span>
            <h3>Small updates make a calmer community.</h3>
            <p>
              Report a broken light, pre-register a guest, or check the latest
              society notice before heading downstairs.
            </p>
            <div className="feature-links">
              <Link to="/visitors">Prepare a visitor <span>→</span></Link>
              <Link to="/complaints">Raise a complaint <span>→</span></Link>
            </div>
          </div>
        </div>

        <div className="access-card">
          <div className="access-orbit"><span>{societyUser?.role?.slice(0, 1)?.toUpperCase()}</span></div>
          <div>
            <span className="eyebrow">Your access</span>
            <h3>{roleLabel}</h3>
            <p>
              Your account is connected to the society backend. Available actions
              change with your role.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
