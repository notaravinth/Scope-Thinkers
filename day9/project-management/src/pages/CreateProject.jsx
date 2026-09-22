import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

function CreateProject() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateProject(e) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setLoading(true);

      const projectRef = await addDoc(
        collection(db, "projects"),
        {
          name: name.trim(),
          description: description.trim(),
          ownerId: currentUser.uid,

          // The creator is automatically the first member.
          memberIds: [currentUser.uid],

          createdAt: serverTimestamp(),
        }
      );

      navigate(`/projects/${projectRef.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      setError(
        "Failed to create project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Project
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a project and start collaborating with
          your team.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreateProject}
          className="space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Project Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="e.g. DigiVault"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white"
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
              placeholder="What is this project about?"
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {loading
                ? "Creating..."
                : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;