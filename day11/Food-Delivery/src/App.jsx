import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import FlowingMenu from "./components/react-bits/FlowingMenu";
import OrderTracking from "./components/OrderTracking";

const demoItems = [
  {
    link: "#",
    text: "Best Food At Your Doorstep",
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1170&q=80",
  },
];

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />

              <div className="h-[100px] w-full border border-black">
                <FlowingMenu
                  items={demoItems}
                  speed={15}
                  textColor="#ffffff"
                  bgColor="#120F17"
                  marqueeBgColor="#ffffff"
                  marqueeTextColor="#120F17"
                  borderColor="#000000"
                />
              </div>

              <Menu />
            </>
          }
        />

        <Route path="/cart" element={<Cart />} />

        <Route path="/order/:orderId" element={<OrderTracking />} />
      </Routes>
    </>
  );
};

export default App;
