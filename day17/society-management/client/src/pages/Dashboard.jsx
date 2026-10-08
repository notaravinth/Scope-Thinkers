import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import useSocietyAuthStore from "../store/societyAuthStore";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const { societyUser } = useSocietyAuthStore();
  const [stats, setStats] = useState({ complaints: 0, visitors: 0, announcements: 0, payments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [complaints, visitors, announcements, payments] = await Promise.all([
          apiFetch("/society-complaints"),
          apiFetch("/society-visitors"),
          apiFetch("/society-announcements"),
          apiFetch("/society-payments"),
        ]);
        setStats({
          complaints: complaints.complaints.length,
          visitors: visitors.visitors.length,
          announcements: announcements.announcements.length,
          payments: payments.payments.filter((p) => p.status !== "paid").length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const firstName = societyUser?.name?.split(" ")[0] || "there";

  return (
    <div className="dashboard-page page-enter">
      <section className="hero-card">
        <div className="hero-copy">
          <div className="hero-kicker"><span /> TUESDAY, 7 OCTOBER</div>
          <h1>Good morning,<br /><em>{firstName}.</em></h1>
          <p>Here’s the little picture of life around Maple Grove. Everything you need, without the paperwork.</p>
          <div className="hero-actions">
            <Link to="/complaints" className="button button-dark">Report an issue <span>↗</span></Link>
            <Link to="/announcements" className="text-link">Read the noticeboard <span>→</span></Link>
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
        <div><span className="eyebrow">Your snapshot</span><h2>What’s happening</h2></div>
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
            <p>Report a broken light, pre-register a guest, or check the latest society notice before heading downstairs.</p>
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
            <h3>{societyUser?.role}</h3>
            <p>Your account is connected to the society backend. Available actions change with your role.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
