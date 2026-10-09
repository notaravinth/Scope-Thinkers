import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthInitializer from "./components/AuthInitializer";
import ProtectedRoute from "./components/ProtectedRoute";
import SocietyLayout from "./components/SocietyLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import Visitors from "./pages/Visitors";
import Announcements from "./pages/Announcements";
import Payments from "./pages/Payments";
import Properties from "./pages/Properties";
import Users from "./pages/Users";
import { ROLE_NAV } from "./config/rolePermissions";

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}> 
            <Route element={<SocietyLayout />}>
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                element={<ProtectedRoute allowedRoles={ROLE_NAV.complaints} />}
              >
                <Route path="/complaints" element={<Complaints />} />
              </Route>

              <Route
                element={<ProtectedRoute allowedRoles={ROLE_NAV.visitors} />}
              >
                <Route path="/visitors" element={<Visitors />} />
              </Route>

              <Route path="/announcements" element={<Announcements />} />

              <Route
                element={<ProtectedRoute allowedRoles={ROLE_NAV.payments} />}
              >
                <Route path="/payments" element={<Payments />} />
              </Route>

              <Route path="/properties" element={<Properties />} />

              <Route
                element={<ProtectedRoute allowedRoles={ROLE_NAV.users} />}
              >
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}

export default App;
