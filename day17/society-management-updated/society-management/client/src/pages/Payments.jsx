import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import useSocietyAuthStore from "../store/societyAuthStore";
import Modal from "../components/Modal";

const Payments = () => {
  const { societyUser } = useSocietyAuthStore();
  const isManager = societyUser?.role === "manager";

  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    property_id: "",
    amount: "",
    due_date: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await apiFetch("/society-payments");
      setPayments(data.payments);
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

  const createBill = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/society-payments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          property_id: form.property_id || null,
        }),
      });
      setForm({ user_id: "", property_id: "", amount: "", due_date: "" });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const markPaid = async (id) => {
    try {
      await apiFetch(`/society-payments/${id}/paid`, { method: "PATCH" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Maintenance bills</p>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">
            Track society maintenance bills and payment status.
          </p>
        </div>
        {isManager && (
          <button className="primary-btn sm" onClick={() => setShowModal(true)}>
            + Create bill
          </button>
        )}
      </div>

      {error && <p className="error-box mb-5">{error}</p>}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-4">Resident</th>
                <th className="px-5 py-4">Property</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Due</th>
                <th className="px-5 py-4">Status</th>
                {isManager && <th className="px-5 py-4">Action</th>}
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-white/5">
                  <td className="px-5 py-4">{payment.user_name || payment.user_id}</td>
                  <td className="px-5 py-4">
                    {payment.block && payment.flat_number
                      ? `${payment.block}-${payment.flat_number}`
                      : "—"}
                  </td>
                  <td className="px-5 py-4">₹{payment.amount}</td>
                  <td className="px-5 py-4">{payment.due_date}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>
                  {isManager && (
                    <td className="px-5 py-4">
                      {payment.status !== "paid" && (
                        <button
                          onClick={() => markPaid(payment.id)}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          Mark paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payments.length === 0 && <div className="empty mt-4">No bills found.</div>}

      {showModal && (
        <Modal title="Create maintenance bill" onClose={() => setShowModal(false)}>
          <form onSubmit={createBill} className="space-y-4">
            <select
              className="select w-full"
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              required
            >
              <option value="">Select resident</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} — {user.email}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              min="1"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <input
              className="input"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              required
            />
            <button className="primary-btn">Create bill</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Payments;
