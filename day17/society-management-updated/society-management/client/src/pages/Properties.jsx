import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import useSocietyAuthStore from "../store/societyAuthStore";
import Modal from "../components/Modal";

const Properties = () => {
  const { societyUser } = useSocietyAuthStore();
  const isManager = societyUser?.role === "manager";

  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    block: "",
    flat_number: "",
    owner_id: "",
  });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await apiFetch("/society-properties");
      setProperties(data.properties);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadUsers = async () => {
    if (!isManager) return;
    try {
      const data = await apiFetch("/society-users");
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    loadUsers();
  }, [isManager]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/society-properties", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          owner_id: form.owner_id || null,
        }),
      });
      setForm({ block: "", flat_number: "", owner_id: "" });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Homes</p>
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">Apartments registered in the society.</p>
        </div>
        {isManager && (
          <button className="primary-btn sm" onClick={() => setShowModal(true)}>
            + Add property
          </button>
        )}
      </div>

      {error && <p className="error-box mb-5">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <div key={property.id} className="card">
            <p className="text-sm text-slate-400">Block {property.block}</p>
            <h2 className="mt-1 text-3xl font-black">
              {property.flat_number}
            </h2>
            <p className="mt-4 text-sm text-slate-400">
              Owner: {property.owner_name || "Not assigned"}
            </p>
          </div>
        ))}
      </div>

      {properties.length === 0 && <div className="empty mt-4">No properties found.</div>}

      {showModal && (
        <Modal title="Add property" onClose={() => setShowModal(false)}>
          <form onSubmit={create} className="space-y-4">
            <input
              className="input"
              placeholder="Block e.g. A"
              value={form.block}
              onChange={(e) => setForm({ ...form, block: e.target.value })}
              required
            />
            <input
              className="input"
              placeholder="Flat number e.g. 203"
              value={form.flat_number}
              onChange={(e) =>
                setForm({ ...form, flat_number: e.target.value })
              }
              required
            />
            <select
              className="select w-full"
              value={form.owner_id}
              onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
            >
              <option value="">No owner yet</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button className="primary-btn">Create property</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Properties;
