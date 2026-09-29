import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithCustomToken } from "firebase/auth";

import { auth } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send OTP."
        );
      }

      setOtpSent(true);
    } catch (error) {
      console.error("Send OTP error:", error);

      setError(
        error.message || "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      if (otp.length !== 6) {
        setError("Enter the 6-digit OTP.");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid OTP."
        );
      }

      await signInWithCustomToken(
        auth,
        data.token
      );

      console.log("OTP verified and user signed in.");

      navigate("/");
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        error.message || "Unable to verify OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome to BusGo
          </h1>

          <p className="mt-2 text-gray-500">
            Login with your email
          </p>
        </div>

        {!otpSent ? (
          <form
            onSubmit={handleSendOTP}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
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
                className="w-full rounded-xl border border-gray-200 p-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-black"
              />

              <p className="mt-2 text-sm text-gray-500">
                OTP sent to {email}
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
              onClick={handleChangeEmail}
              className="w-full text-sm text-gray-500 hover:text-black"
            >
              Change email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;