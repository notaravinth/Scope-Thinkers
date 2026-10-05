import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";

import { auth } from "../firebase/firebase";

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Authenticate using Firebase
       */
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      /*
       * Authentication succeeded.
       */
      navigate("/chat");
    } catch (error) {
      console.error("Login error:", error);

      switch (error.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;

        default:
          setError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to continue your conversations."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
        />

        {error && (
          <div className="rounded-2xl border border-[#C2956E] bg-[#2B2129] px-4 py-3 text-sm text-[#DD8E58]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DD8E58] px-5 py-3.5 font-semibold text-[#2B2129] transition hover:bg-[#C2956E] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign in"}

          {!loading && (
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#C2956E]">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#DD8E58] transition hover:text-[#E5D1B8]"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignIn;