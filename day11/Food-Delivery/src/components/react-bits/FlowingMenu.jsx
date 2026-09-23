import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = "#",
  bgColor = "#120F17",
  marqueeBgColor = "#000",
  marqueeTextColor = "#fff",
  borderColor = "#222",
}) {
  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
          />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({
  link,
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isFirst,
}) {
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent =
        marqueeInnerRef.current.querySelector(".marquee-part");

      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;

      const needed = Math.ceil(viewportWidth / contentWidth) + 2;

      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();

    window.addEventListener("resize", calculateRepetitions);

    return () => {
      window.removeEventListener("resize", calculateRepetitions);
    };
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent =
        marqueeInnerRef.current.querySelector(".marquee-part");

      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;

      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    const timer = setTimeout(setupMarquee, 50);

    return () => {
      clearTimeout(timer);

      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, image, repetitions, speed]);

  return (
    <div
      className="relative flex-1 overflow-hidden"
      style={{
        borderTop: isFirst ? "none" : `1px solid ${borderColor}`,
        backgroundColor: marqueeBgColor,
      }}
    >
      <a
        href={link}
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ color: marqueeTextColor }}
      >
        <div className="h-full w-fit flex items-center" ref={marqueeInnerRef}>
          {[...Array(repetitions)].map((_, idx) => (
            <div
              className="marquee-part flex shrink-0 items-center"
              key={idx}
              style={{
                color: marqueeTextColor,
              }}
            >
              <span className="whitespace-nowrap px-[1vw] text-[4vh] font-normal uppercase leading-none">
                {text}
              </span>

              <div
                className="my-[2em] mx-[2vw] h-[7vh] w-[200px] rounded-[50px] bg-cover bg-center py-[1em]"
                style={{
                  backgroundImage: `url(${image})`,
                }}
              />
            </div>
          ))}
        </div>
      </a>
    </div>
  );
}

export default FlowingMenu;
