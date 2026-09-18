import { Link } from "react-router-dom";

function Login() {
  return (
    <div>
      <h1>Login</h1>

      <p>
        Don't have an account?{" "}
        <Link to="/signup">Sign Up</Link>
      </p>

      <Link to="/dashboard">Go to User Dashboard</Link>

      <br />

      <Link to="/admin">Go to Admin Dashboard</Link>
    </div>
  );
}

export default Login;