import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [confirmationResult, setConfirmationResult] =
    useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const saveUserProfile = async (user) => {
    const userRef = doc(db, "busgo_users", user.uid);
    const userSnapshot = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      photoURL: user.photoURL || "",
      updatedAt: serverTimestamp(),
    };

    if (!userSnapshot.exists()) {
      userData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, userData, {
      merge: true,
    });
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setGoogleLoading(true);

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(
        auth,
        provider
      );

      await saveUserProfile(result.user);

      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      setError(error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const createRecaptcha = () => {
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired");

          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        },
      }
    );

    return window.recaptchaVerifier;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      if (phone.length !== 10) {
        setError("Enter a valid 10-digit phone number.");
        return;
      }

      const fullPhoneNumber = `+91${phone}`;

      const appVerifier = createRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        appVerifier
      );

      setConfirmationResult(result);

      console.log("OTP sent successfully.");
    } catch (error) {
      console.error("OTP error:", error);

      setError(
        error.message || "Failed to send OTP."
      );

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      if (!confirmationResult) {
        setError("Please request an OTP first.");
        return;
      }

      if (otp.length !== 6) {
        setError("Enter the 6-digit OTP.");
        return;
      }

      const result =
        await confirmationResult.confirm(otp);

      await saveUserProfile(result.user);

      navigate("/");
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        error.message || "Invalid OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = () => {
    setConfirmationResult(null);
    setOtp("");
    setError("");

    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome to BusGo
          </h1>

          <p className="mt-2 text-gray-500">
            Login or create your account
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full rounded-xl border border-gray-200 p-3 font-medium transition hover:bg-gray-50 disabled:opacity-50"
        >
          {googleLoading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-sm text-gray-400">
            OR
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {!confirmationResult ? (
          <form
            onSubmit={handleSendOTP}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>

              <div className="flex">
                <div className="flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-4 text-gray-600">
                  +91
                </div>

                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  maxLength={10}
                  required
                  className="w-full rounded-r-xl border border-gray-200 p-3 outline-none focus:border-black"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                phone.length !== 10
              }
              className="w-full rounded-xl bg-black p-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Sending OTP..."
                : "Send OTP"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleVerifyOTP}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Enter OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                maxLength={6}
                required
                className="w-full rounded-xl border border-gray-200 p-3 text-center text-xl tracking-[0.4em] outline-none focus:border-black"
              />

              <p className="mt-2 text-sm text-gray-500">
                OTP sent to +91 {phone}
              </p>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                otp.length !== 6
              }
              className="w-full rounded-xl bg-black p-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleChangePhone}
              className="w-full text-sm text-gray-500 hover:text-black"
            >
              Change phone number
            </button>
          </form>
        )}

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}

export default Login;