import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("Creating Firebase account...");

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      console.log(
        "Firebase account created:",
        user.uid
      );

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      console.log("User document created.");

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Signup error:", err);

      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create account
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Start managing your projects with ProjectFlow.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSignup}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Your name"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-gray-900 hover:underline dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;