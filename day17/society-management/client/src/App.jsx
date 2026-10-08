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

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<SocietyLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/visitors" element={<Visitors />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/properties" element={<Properties />} />

              <Route
                element={
                  <ProtectedRoute allowedRoles={["manager"]} />
                }
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
