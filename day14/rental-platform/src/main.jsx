import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import { PropertyProvider } from "./context/PropertyContext.jsx";
import { FavoritesProvider } from "./context/FavouritesContext.jsx";

import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <PropertyProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </PropertyProvider>
    </BrowserRouter>
  </StrictMode>
);