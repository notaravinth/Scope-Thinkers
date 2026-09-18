import { Link } from "react-router-dom";

function Signup() {
  return (
    <div>
      <h1>Signup</h1>

      <p>
        Already have an account?{" "}
        <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;