import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";

import { auth, db } from "../firebase/firebase";

const SignUp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Create Firebase Authentication account
       */
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      /*
       * Add display name to Firebase Auth profile
       */
      await updateProfile(user, {
        displayName: name.trim(),
      });

      /*
       * Create Chatter-specific user document
       *
       * This is separate from Firebase Authentication.
       */
      await setDoc(doc(db, "chatter_users", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: user.email,
        photoURL: null,
        status: "offline",
        createdAt: serverTimestamp(),
      });

      /*
       * Authentication succeeded.
       */
      navigate("/chat");
    } catch (error) {
      console.error("Signup error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Password is too weak.");
          break;

        default:
          setError("Unable to create your account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account."
      subtitle="Join Chatter and start connecting in real time."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <AuthInput
          label="Name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Create a password"
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
          {loading ? "Creating account..." : "Create account"}

          {!loading && (
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#C2956E]">
        Already have an account?{" "}
        <Link
          to="/signin"
          className="font-semibold text-[#DD8E58] transition hover:text-[#E5D1B8]"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUp;