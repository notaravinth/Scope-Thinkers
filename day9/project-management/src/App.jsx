import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectDetails from "./pages/ProjectDetails";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        > 
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/create" element={<CreateProject />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

<Route path="*" element={<Navigate to="/projects" replace />} />      </Routes>
    </BrowserRouter>
  );
}

export default App;