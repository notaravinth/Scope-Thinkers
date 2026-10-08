import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import useSocietyAuthStore from "../store/societyAuthStore";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { firebaseUser, societyUser } = useSocietyAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (firebaseUser && societyUser) navigate("/dashboard", { replace: true });
  }, [firebaseUser, societyUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      setError(error.message.replace("Firebase: ", "").replace(/\s*\(auth\/.*\)$/, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-art">
        <div className="auth-brand"><div className="brand-mark"><span>NH</span></div><div><b>Nest<span>Hub</span></b><small>Maple Grove Society</small></div></div>
        <div className="auth-art-copy">
          <span className="eyebrow">A place to belong</span>
          <h1>Neighbourhood life,<br /><em>without the noise.</em></h1>
          <p>Visitors, notices, repairs and the everyday things that keep a community moving — all in one quiet corner.</p>
        </div>
        <div className="auth-collage">
          <div className="collage-note note-one"><span>08:42</span><b>Gate is calm</b><small>12 visitors today</small></div>
          <div className="collage-note note-two"><span>NEW</span><b>Water update</b><small>Posted to everyone</small></div>
          <div className="collage-house"><i /><i /><i /><i /><i /></div>
        </div>
        <div className="auth-footer">BUILT FOR REAL PEOPLE · MAPLE GROVE · 2026</div>
      </div>

      <div className="auth-form-side">
        <form onSubmit={handleLogin} className="auth-form">
          <div className="mobile-brand"><div className="brand-mark"><span>NH</span></div><b>Nest<span>Hub</span></b></div>
          <span className="eyebrow">Welcome back</span>
          <h2>Let’s pick up<br />where you left off.</h2>
          <p className="auth-muted">Sign in to your society account.</p>

          <label>Email address<input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></label>
          <label>Password<input name="password" type="password" placeholder="Your password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></label>
          {error && <p className="auth-error">{error}</p>}
          <button disabled={loading} className="button button-coral auth-submit">{loading ? "Opening your space…" : "Enter NestHub ↗"}</button>
          <p className="auth-switch">New to the society? <Link to="/signup">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Login;
