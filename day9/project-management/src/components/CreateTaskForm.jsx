import { useState } from "react";
import { createTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";

function CreateTaskForm({
  projectId,
  members,
  onTaskCreated,
  onCancel,
}) {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!currentUser) {
      setError("You must be logged in.");
      return;
    }

    try {
      setLoading(true);

      await createTask({
        projectId,
        title,
        description,
        priority,
        assignedTo,
        createdBy: currentUser.uid,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignedTo("");

      onTaskCreated();
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Create Task
      </h2>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Add a new task to this project.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Task Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fix authentication bug"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Describe the task..."
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-white dark:focus:ring-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Assign To
            </label>

            <select
              value={assignedTo}
              onChange={(e) =>
                setAssignedTo(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-white dark:focus:ring-white"
            >
              <option value="">Unassigned</option>

              {members.map((member) => (
                <option
                  key={member.uid}
                  value={member.uid}
                >
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTaskForm;