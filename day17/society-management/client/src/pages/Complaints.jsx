import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import useSocietyAuthStore from "../store/societyAuthStore";
import Modal from "../components/Modal";

const Complaints = () => {
  const { societyUser } = useSocietyAuthStore();
  const canCreate = ["resident", "owner"].includes(societyUser?.role);
  const canManage = ["manager", "committee"].includes(societyUser?.role);

  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await apiFetch("/society-complaints");
      setComplaints(data.complaints);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createComplaint = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/society-complaints", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ title: "", description: "" });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/society-complaints/${id}/status`, {
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
          <p className="eyebrow">Society service</p>
          <h1 className="page-title">Complaints</h1>
          <p className="page-subtitle">
            Report problems and follow their resolution.
          </p>
        </div>
        {canCreate && (
          <button className="primary-btn sm" onClick={() => setShowModal(true)}>
            + New complaint
          </button>
        )}
      </div>

      {error && <p className="error-box mb-5">{error}</p>}

      <div className="space-y-3">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="card">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-bold">{complaint.title}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {complaint.description}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Created by {complaint.creator_name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`badge ${complaint.status}`}>
                  {complaint.status.replace("_", " ")}
                </span>

                {canManage && (
                  <select
                    value={complaint.status}
                    onChange={(e) => updateStatus(complaint.id, e.target.value)}
                    className="select"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}

        {complaints.length === 0 && (
          <div className="empty">No complaints found.</div>
        )}
      </div>

      {showModal && (
        <Modal title="New complaint" onClose={() => setShowModal(false)}>
          <form onSubmit={createComplaint} className="space-y-4">
            <input
              className="input"
              placeholder="Complaint title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="input min-h-32 resize-none"
              placeholder="Describe the problem"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
            <button className="primary-btn">Submit complaint</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Complaints;
