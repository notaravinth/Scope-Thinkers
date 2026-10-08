import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import useSocietyAuthStore from "../store/societyAuthStore";
import Modal from "../components/Modal";

const Visitors = () => {
  const { societyUser } = useSocietyAuthStore();
  const canCreate = ["resident", "owner"].includes(societyUser?.role);
  const isSecurity = societyUser?.role === "security";

  const [visitors, setVisitors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ visitor_name: "", visit_date: "" });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await apiFetch("/society-visitors");
      setVisitors(data.visitors);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createVisitor = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/society-visitors", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ visitor_name: "", visit_date: "" });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/society-visitors/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Entry management</p>
          <h1 className="page-title">Visitors</h1>
          <p className="page-subtitle">
            Pre-register guests and keep entry records.
          </p>
        </div>
        {canCreate && (
          <button className="primary-btn sm" onClick={() => setShowModal(true)}>
            + Add visitor
          </button>
        )}
      </div>

      {error && <p className="error-box mb-5">{error}</p>}

      <div className="space-y-3">
        {visitors.map((visitor) => (
          <div key={visitor.id} className="card">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-bold">{visitor.visitor_name}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Visiting {visitor.resident_name} · {visitor.visit_date}
                </p>
              </div>

              {isSecurity ? (
                <select
                  value={visitor.status}
                  onChange={(e) => updateStatus(visitor.id, e.target.value)}
                  className="select"
                >
                  <option value="expected">Expected</option>
                  <option value="entered">Entered</option>
                  <option value="exited">Exited</option>
                </select>
              ) : (
                <span className={`badge ${visitor.status}`}>
                  {visitor.status}
                </span>
              )}
            </div>
          </div>
        ))}

        {visitors.length === 0 && (
          <div className="empty">No visitors found.</div>
        )}
      </div>

      {showModal && (
        <Modal title="Add visitor" onClose={() => setShowModal(false)}>
          <form onSubmit={createVisitor} className="space-y-4">
            <input
              className="input"
              placeholder="Visitor name"
              value={form.visitor_name}
              onChange={(e) =>
                setForm({ ...form, visitor_name: e.target.value })
              }
              required
            />
            <input
              className="input"
              type="date"
              value={form.visit_date}
              onChange={(e) =>
                setForm({ ...form, visit_date: e.target.value })
              }
              required
            />
            <button className="primary-btn">Add visitor</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Visitors;
