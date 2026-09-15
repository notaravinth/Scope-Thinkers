import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const DEFAULT_ITEMS = [
  {
    label: "Home",
    href: "#",
    ariaLabel: "Home",
    rotation: -8,
    hoverStyles: {
      bgColor: "#3b82f6",
      textColor: "#ffffff",
    },
  },
  {
    label: "Technology",
    href: "#",
    ariaLabel: "Technology",
    rotation: 8,
    hoverStyles: {
      bgColor: "#8b5cf6",
      textColor: "#ffffff",
    },
  },
  {
    label: "Sports",
    href: "#",
    ariaLabel: "Sports",
    rotation: -8,
    hoverStyles: {
      bgColor: "#10b981",
      textColor: "#ffffff",
    },
  },
  {
    label: "Business",
    href: "#",
    ariaLabel: "Business",
    rotation: 8,
    hoverStyles: {
      bgColor: "#f59e0b",
      textColor: "#ffffff",
    },
  },
  {
    label: "Entertainment",
    href: "#",
    ariaLabel: "Entertainment",
    rotation: -8,
    hoverStyles: {
      bgColor: "#ef4444",
      textColor: "#ffffff",
    },
  },
];

export default function BubbleMenu({
  logo,
  onMenuClick,
  onItemClick,
  className,
  style,
  menuAriaLabel = "Toggle menu",
  menuBg = "#ffffff",
  menuContentColor = "#111111",
  useFixedPosition = false,
  items,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const overlayRef = useRef(null);
  const bubblesRef = useRef([]);
  const labelRefs = useRef([]);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;

  /*
   * Toggle menu
   */
  const handleToggle = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setShowOverlay(true);
      setIsMenuOpen(true);
    }

    onMenuClick?.(!isMenuOpen);
  };

  /*
   * Open / close animation
   */
  useEffect(() => {
    const overlay = overlayRef.current;

    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);

    if (!overlay || bubbles.length === 0) {
      return;
    }

    /*
     * OPEN
     */
    if (isMenuOpen) {
      gsap.killTweensOf([overlay, ...bubbles, ...labels]);

      gsap.set(overlay, {
        display: "flex",
      });

      // Start all bubbles small
      gsap.set(bubbles, {
        scale: 0,
        opacity: 0,
        transformOrigin: "50% 50%",
      });

      // Start labels slightly lower
      gsap.set(labels, {
        y: 15,
        opacity: 0,
      });

      // Bubbles appear with a small stagger
      gsap.to(bubbles, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.07,
        ease: "back.out(1.7)",
      });

      // Labels appear slightly after bubbles
      gsap.to(labels, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.07,
        delay: 0.08,
        ease: "power2.out",
      });
    } else if (showOverlay) {

    /*
     * CLOSE
     */
      gsap.killTweensOf([overlay, ...bubbles, ...labels]);

      // Labels disappear
      gsap.to(labels, {
        y: 10,
        opacity: 0,
        duration: 0.15,
        stagger: 0.03,
        ease: "power2.in",
      });

      // Bubbles disappear together
      gsap.to(bubbles, {
        scale: 0,
        opacity: 0,
        duration: 0.25,
        stagger: 0.03,
        delay: 0.03,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(overlay, {
            display: "none",
          });

          setShowOverlay(false);
        },
      });
    }
  }, [isMenuOpen, showOverlay]);

  /*
   * Handle desktop rotations
   */
  useEffect(() => {
    const handleResize = () => {
      const bubbles = bubblesRef.current.filter(Boolean);

      const isDesktop = window.innerWidth >= 900;

      bubbles.forEach((bubble, index) => {
        const item = menuItems[index];

        if (!item) {
          return;
        }

        gsap.set(bubble, {
          rotation: isDesktop ? (item.rotation ?? 0) : 0,
        });
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [menuItems]);

  return (
    <>
      <style>{`
        .bubble-menu .menu-line {
          transition:
            transform 0.25s ease,
            opacity 0.25s ease;
          transform-origin: center;
        }

        .bubble-menu-items .pill-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 18px;
        }

        .bubble-menu-items .pill-link {
          transition:
            background 0.25s ease,
            color 0.25s ease,
            box-shadow 0.25s ease;
        }

        @media (min-width: 900px) {
          .bubble-menu-items .pill-link {
            transform: rotate(var(--item-rot));
          }

          .bubble-menu-items .pill-link:hover {
            transform:
              rotate(var(--item-rot))
              scale(1.06);

            background:
              var(--hover-bg) !important;

            color:
              var(--hover-color) !important;

            box-shadow:
              0 12px 30px rgba(0, 0, 0, 0.18);
          }

          .bubble-menu-items .pill-link:active {
            transform:
              rotate(var(--item-rot))
              scale(0.94);
          }
        }

        @media (max-width: 899px) {
          .bubble-menu-items {
            padding-top: 100px;
            align-items: flex-start;
          }

          .bubble-menu-items .pill-list {
            flex-direction: column;
            gap: 14px;
          }

          .bubble-menu-items .pill-col {
            flex: 0 0 auto !important;
            margin-left: 0 !important;
          }

          .bubble-menu-items .pill-link {
            width: 180px !important;
            min-height: 60px !important;
            padding: 0.75rem 1rem;
            font-size: 1.1rem;
          }

          .bubble-menu-items .pill-link:hover {
            transform: scale(1.06);
            background: var(--hover-bg);
            color: var(--hover-color);
          }

          .bubble-menu-items .pill-link:active {
            transform: scale(0.94);
          }
        }
      `}</style>

      {/* View Categories */}
      <nav
        className={[
          "bubble-menu",
          useFixedPosition ? "fixed" : "absolute",
          "left-0 right-0 top-0",
          "flex items-center justify-center",
          "pointer-events-none",
          "z-[1001]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        aria-label="Main navigation"
      >
        <button
          type="button"
          className={[
            "bubble toggle-bubble menu-btn",
            "inline-flex items-center justify-center",
            "rounded-full",
            "shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
            "pointer-events-auto",
            "border-0 cursor-pointer",
            "px-5 py-3",
            "text-base font-semibold",
            "transition-all duration-300",
            "hover:scale-105",
            "will-change-transform",
          ].join(" ")}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
          style={{
            background: menuBg,
            color: menuContentColor,
          }}
        >
          {isMenuOpen ? "Close Categories ✕" : "View Categories"}
        </button>
      </nav>

      {/* Category Bubbles */}
      {showOverlay && (
        <div
          ref={overlayRef}
          className={[
            "bubble-menu-items",
            useFixedPosition ? "fixed" : "absolute",
            "left-0 right-0 top-20 bottom-0",
            "flex items-center justify-center",
            "pointer-events-none",
            "z-[1000]",
          ].join(" ")}
          aria-hidden={!isMenuOpen}
        >
          <ul
            className={[
              "pill-list",
              "list-none",
              "m-0",
              "px-6",
              "w-full",
              "max-w-[1200px]",
              "mx-auto",
              "pointer-events-auto",
            ].join(" ")}
            role="menu"
            aria-label="News categories"
          >
            {menuItems.map((item, index) => (
              <li
                key={index}
                role="none"
                className={[
                  "pill-col",
                  "flex justify-center items-stretch",
                  "flex-none",
                  "box-border",
                ].join(" ")}
              >
                <a
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  onClick={(event) => {
                    event.preventDefault();

                    onItemClick?.(item);

                    // Close menu
                    setIsMenuOpen(false);
                  }}
                  className={[
                    "pill-link",
                    "flex items-center justify-center",
                    "rounded-full",
                    "no-underline",
                    "bg-white",
                    "shadow-[0_4px_14px_rgba(0,0,0,0.10)]",
                    "relative",
                    "box-border",
                    "whitespace-nowrap",
                    "overflow-hidden",
                    "cursor-pointer",
                  ].join(" ")}
                  style={{
                    "--item-rot": `${item.rotation ?? 0}deg`,

                    "--pill-bg": menuBg,

                    "--pill-color": menuContentColor,

                    "--hover-bg": item.hoverStyles?.bgColor || "#f3f4f6",

                    "--hover-color":
                      item.hoverStyles?.textColor || menuContentColor,

                    background: "var(--pill-bg)",

                    color: "var(--pill-color)",

                    minHeight: "65px",

                    width: "180px",

                    padding: "0.75rem 1.25rem",

                    fontSize: "1.1rem",

                    fontWeight: 600,

                    lineHeight: 1.2,

                    willChange: "transform",
                  }}
                  ref={(element) => {
                    if (element) {
                      bubblesRef.current[index] = element;
                    }
                  }}
                >
                  <span
                    className="pill-label inline-block"
                    style={{
                      willChange: "transform, opacity",

                      height: "1.2em",

                      lineHeight: 1.2,
                    }}
                    ref={(element) => {
                      if (element) {
                        labelRefs.current[index] = element;
                      }
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
