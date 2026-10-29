import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

const isAdminRoute = window.location.pathname.replace(/\/+$/, "") === "/admin";
const RootComponent = isAdminRoute ? AdminDashboard : App;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
