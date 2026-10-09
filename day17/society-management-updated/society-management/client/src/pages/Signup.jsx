import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(credential.user, { displayName: formData.name });
      const token = await credential.user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/society-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not create society profile");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message.replace("Firebase: ", "").replace(/\s*\(auth\/.*\)$/, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-signup page-enter">
      <div className="auth-art signup-art">
        <div className="auth-brand"><div className="brand-mark"><span>NH</span></div><div><b>Nest<span>Hub</span></b><small>Maple Grove Society</small></div></div>
        <div className="signup-manifesto"><span>01</span><h1>Make the everyday<br /><em>feel effortless.</em></h1><p>One account for the little things that make a society feel like home.</p></div>
        <div className="signup-steps"><div><b>01</b><span>Join your society</span></div><div><b>02</b><span>Get your resident access</span></div><div><b>03</b><span>Stay in the loop</span></div></div>
      </div>

      <div className="auth-form-side">
        <form onSubmit={handleSignup} className="auth-form">
          <div className="mobile-brand"><div className="brand-mark"><span>NH</span></div><b>Nest<span>Hub</span></b></div>
          <span className="eyebrow">New neighbour</span>
          <h2>Your space<br />starts here.</h2>
          <p className="auth-muted">New accounts begin as residents. A manager can update your role later.</p>
          <label>Full name<input name="name" placeholder="Aravinth Ravichandran" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></label>
          <label>Email address<input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></label>
          <label>Password<input name="password" type="password" minLength={6} placeholder="At least 6 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></label>
          {error && <p className="auth-error">{error}</p>}
          <button disabled={loading} className="button button-dark auth-submit">{loading ? "Making your account…" : "Join NestHub ↗"}</button>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
