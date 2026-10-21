// frontend/src/AuthScreen.jsx

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firebase";

const inputClass =
  "w-full rounded-xl border border-[#dce2d4] bg-white px-4 py-3 text-sm text-[#25372b] outline-none transition placeholder:text-[#8b9588] focus:border-[#537a4b] focus:ring-4 focus:ring-[#537a4b]/10";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (mode !== "reset" && password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await sendPasswordResetEmail(auth, email.trim());
        setMessage("Password reset email sent. Check your inbox.");
      }
    } catch (err) {
      const errors = {
        "auth/email-already-in-use":
          "An account with this email already exists.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "No account was found with this email.",
        "auth/wrong-password": "Incorrect email or password.",
        "auth/weak-password": "Choose a stronger password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed":
          "Network error. Check your internet connection.",
        "auth/operation-not-allowed":
          "Email/password sign-in is not enabled in Firebase yet.",
      };

      setError(errors[err.code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isReset = mode === "reset";
  const isSignup = mode === "signup";

  return (
    <main className="min-h-screen bg-[#f7f7f0] px-5 py-10 text-[#25372b]">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-[#dce2d4] bg-[#fbfcf7] shadow-xl md:grid-cols-2">
          <section className="hidden flex-col justify-between bg-[#254b35] p-10 text-white md:flex">
            <a href="#top" className="text-2xl font-black tracking-tight">
              matchwise<span className="text-[#d9f36a]">.</span>
            </a>

            <div>
              <p className="mb-4 text-xs font-bold tracking-[.24em] text-[#d9f36a]">
                YOUR NEXT CHAPTER
              </p>

              <h1 className="text-5xl font-semibold leading-tight tracking-tight">
                Good work.
                <br />
                <span className="font-serif italic text-[#d9f36a]">
                  Good fit.
                </span>
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
                Find opportunities that align with your skills and experience.
                Your next move starts here.
              </p>
            </div>

            <p className="text-xs text-white/60">
              Thoughtful matches, not keyword bingo.
            </p>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-8 md:hidden">
              <a href="#top" className="text-2xl font-black">
                matchwise<span className="text-[#8eb66e]">.</span>
              </a>
            </div>

            <p className="text-xs font-extrabold tracking-[.2em] text-[#668552]">
              {isReset ? "ACCOUNT RECOVERY" : "WELCOME TO MATCHWISE"}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {isReset
                ? "Reset your password"
                : isSignup
                  ? "Create your account."
                  : "Welcome back."}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#737d70]">
              {isReset
                ? "Enter your email and we'll send you a reset link."
                : isSignup
                  ? "Create an account to get started with your job search."
                  : "Sign in to continue finding your next opportunity."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email address
                </label>

                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              {!isReset && (
                <div>
                  <label
                    htmlFor="auth-password"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Password
                  </label>

                  <input
                    id="auth-password"
                    type="password"
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    minLength={6}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    className={inputClass}
                  />
                </div>
              )}

              {isSignup && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Confirm password
                  </label>

                  <input
                    id="auth-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter your password again"
                    className={inputClass}
                  />
                </div>
              )}

              {mode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setError("");
                      setMessage("");
                    }}
                    className="text-xs font-bold text-[#476b3e] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-[#ecc7bd] bg-[#fff0eb] px-4 py-3 text-sm text-[#934e3f]"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className="rounded-xl border border-[#b9d0a9] bg-[#eaf2e4] px-4 py-3 text-sm text-[#31543a]"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-full bg-[#254b35] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#183b27] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isReset
                    ? "Send reset email"
                    : isSignup
                      ? "Create account"
                      : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#737d70]">
              {isReset ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setMessage("");
                  }}
                  className="font-bold text-[#476b3e] hover:underline"
                >
                  Back to sign in
                </button>
              ) : (
                <>
                  {isSignup
                    ? "Already have an account? "
                    : "Don't have an account? "}

                  <button
                    type="button"
                    onClick={() => {
                      setMode(isSignup ? "login" : "signup");
                      setError("");
                      setMessage("");
                    }}
                    className="font-bold text-[#476b3e] hover:underline"
                  >
                    {isSignup ? "Sign in" : "Sign up"}
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
