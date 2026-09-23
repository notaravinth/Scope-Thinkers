import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GooeyNav from "./react-bits/GooeyNav";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const isCartPage = location.pathname === "/cart";

  // Navbar glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Detect active section
  useEffect(() => {
    if (location.pathname === "/cart") {
      setActiveSection("cart");
      return;
    }

    if (location.pathname !== "/") {
      return;
    }

    const handleScroll = () => {
      const menu = document.getElementById("menu");

      if (!menu) return;

      const menuTop = menu.getBoundingClientRect().top;

      if (menuTop <= 130) {
        setActiveSection("menu");
      } else {
        setActiveSection("home");
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  const items = [
    {
      label: "Home",
      href: "/",
      id: "home",
    },
    {
      label: "Menu",
      href: "/#menu",
      id: "menu",
    },
    {
      label: "Cart",
      href: "/cart",
      id: "cart",
    },
  ];

  const activeIndex = items.findIndex(
    (item) => item.id === activeSection
  );

  const handleNavigation = (href) => {
    if (href === "/") {
      if (location.pathname !== "/") {
        navigate("/");
      }

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 50);

      return;
    }

    if (href === "/#menu") {
      if (location.pathname !== "/") {
        navigate("/");

        setTimeout(() => {
          document
            .getElementById("menu")
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 100);
      } else {
        document
          .getElementById("menu")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }

      return;
    }

    if (href === "/cart") {
      navigate("/cart");
    }
  };

  return (
    <nav className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
      <div
        className={`rounded-full border px-2 py-2 shadow-lg backdrop-blur-xl transition-all duration-300 ${
          isCartPage
            ? "border-black/20 bg-black/30 shadow-black/15"
            : scrolled
            ? "border-black/10 bg-white/90 shadow-black/10"
            : "border-white/30 bg-white/15"
        }`}
      >
        <GooeyNav
          items={items}
          particleCount={18}
          particleDistances={[70, 10]}
          particleR={35}
          animationTime={500}
          timeVariance={250}
          colors={[1, 2, 3, 1, 2, 3]}
          initialActiveIndex={
            activeIndex >= 0 ? activeIndex : 0
          }
          activeIndex={
            activeIndex >= 0 ? activeIndex : 0
          }
          scrolled={scrolled}
          onNavigate={handleNavigation}
        />
      </div>
    </nav>
  );
};

export default Navbar;