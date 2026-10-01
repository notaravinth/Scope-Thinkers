import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Favorites from "./pages/Favourites";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/favorites"
          element={<Favorites />}
        />
      </Routes>
    </>
  );
};

export default App;