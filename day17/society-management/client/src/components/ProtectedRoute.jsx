import { Navigate, Outlet, useLocation } from "react-router-dom";
import useSocietyAuthStore from "../store/societyAuthStore";

const ProtectedRoute = ({ allowedRoles }) => {
  const { firebaseUser, societyUser, loading } = useSocietyAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        Loading society...
      </div>
    );
  }

  if (!firebaseUser || !societyUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(societyUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
