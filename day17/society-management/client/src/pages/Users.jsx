import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

const roles = ["resident", "owner", "committee", "security", "manager"];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await apiFetch("/society-users");
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await apiFetch(`/society-users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
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
          <p className="eyebrow">Access control</p>
          <h1 className="page-title">Society users</h1>
          <p className="page-subtitle">
            Manage roles and see who belongs to the society.
          </p>
        </div>
      </div>

      {error && <p className="error-box mb-5">{error}</p>}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/5">
                  <td className="px-5 py-4 font-semibold">{user.name}</td>
                  <td className="px-5 py-4 text-slate-400">{user.email}</td>
                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="select"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
