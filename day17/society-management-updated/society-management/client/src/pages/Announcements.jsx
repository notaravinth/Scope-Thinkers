import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import useSocietyAuthStore from "../store/societyAuthStore";
import Modal from "../components/Modal";

const Announcements = () => {
  const { societyUser } = useSocietyAuthStore();
  const canCreate = ["manager", "committee"].includes(societyUser?.role);
  const canDelete = societyUser?.role === "manager";

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await apiFetch("/society-announcements");
      setItems(data.announcements);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await apiFetch("/society-announcements", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ title: "", content: "" });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      await apiFetch(`/society-announcements/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Community updates</p>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">
            Important messages for everyone in the society.
          </p>
        </div>
        {canCreate && (
          <button className="primary-btn sm" onClick={() => setShowModal(true)}>
            + Announcement
          </button>
        )}
      </div>

      {error && <p className="error-box mb-5">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{item.title}</h2>
                <p className="mt-3 whitespace-pre-wrap text-slate-400">
                  {item.content}
                </p>
              </div>
              {canDelete && (
                <button
                  onClick={() => remove(item.id)}
                  className="text-xs text-slate-500 hover:text-red-400"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Posted by {item.author_name}
            </p>
          </article>
        ))}
      </div>

      {items.length === 0 && <div className="empty mt-4">No announcements.</div>}

      {showModal && (
        <Modal title="Create announcement" onClose={() => setShowModal(false)}>
          <form onSubmit={create} className="space-y-4">
            <input
              className="input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="input min-h-40 resize-none"
              placeholder="Message"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
            <button className="primary-btn">Publish</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Announcements;
