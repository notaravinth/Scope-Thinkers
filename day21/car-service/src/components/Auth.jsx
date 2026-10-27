import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });

        if (error) throw error;

        if (!data.session) {
          setMessage(
            "Account created. Check your email to confirm your account.",
          );
        }
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8F6] px-5 py-10 text-[#262E2C]">
      <section className="w-full max-w-md rounded-2xl border border-[#E8EBE7] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4B7579] text-lg font-bold text-white">
            m.
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              motive<span className="text-[#4B7579]">.</span>
            </h1>
            <p className="text-xs text-[#89938D]">VEHICLE CARE</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight">
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#89938D]">
          {isLogin
            ? "Sign in to manage your vehicles and service requests."
            : "Create an account to keep your vehicle care organised."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {!isLogin && (
            <label className="block text-sm font-medium">
              Full name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="mt-2 h-11 w-full rounded-xl border border-[#DFE5DF] px-3 text-sm outline-none focus:border-[#4B7579]"
                placeholder="Your name"
              />
            </label>
          )}

          <label className="block text-sm font-medium">
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="mt-2 h-11 w-full rounded-xl border border-[#DFE5DF] px-3 text-sm outline-none focus:border-[#4B7579]"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-medium">
            Password
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="mt-2 h-11 w-full rounded-xl border border-[#DFE5DF] px-3 text-sm outline-none focus:border-[#4B7579]"
              placeholder="At least 6 characters"
            />
          </label>

          {message && (
            <p
              role="status"
              className="rounded-lg bg-[#F3F5F1] p-3 text-sm leading-5 text-[#4B7579]"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-[#4B7579] text-sm font-semibold text-white transition hover:bg-[#3E6568] disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#89938D]">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            className="font-semibold text-[#4B7579] hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}
