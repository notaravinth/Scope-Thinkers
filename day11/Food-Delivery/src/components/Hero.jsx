import React from "react";
import FoldText from "./react-bits/FoldText";
import SpecularButton from "./react-bits/SpecularButton";
import Grainient from "./react-bits/Grainient";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-[#E8F7EE]"
    >
      <div className="absolute inset-0 z-0">
        <div
          style={{
            width: "100%",
            height: "800px",
            position: "relative",
          }}
        >
          <Grainient
            color1="#FF0000"
            color2="#FF8C00"
            color3="#7CFC00"
            timeSpeed={0.25}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={2}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.05}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.9}
          />
        </div>
      </div>

      <div className="absolute inset-0 z-0 bg-white/10" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <FoldText
          text="Foodity"
          splitBy="char"
          hinge="top"
          trigger="mount"
          duration={1.0}
          stagger={0.045}
          ease="power2.out"
          perspective={600}
          creaseShading={0}
          fontSize={80}
          fontWeight={800}
          color="#123524"
        />

        <FoldText
          className="mt-4"
          text="Where Food Meets Convenience"
          splitBy="char"
          hinge="top"
          trigger="mount"
          duration={1.0}
          stagger={0.045}
          ease="power2.out"
          perspective={600}
          creaseShading={0}
          fontSize={64}
          fontWeight={700}
          color="#123524"
        />

        <SpecularButton
          className="mt-12"
          size="lg"
          radius={30}
          tint="#ffffff"
          tintOpacity={0.15}
          blur={4}
          textColor="#123524"
          lineColor="#ffffff"
          baseColor="#F8FAF8"
          intensity={4}
          shineSize={10}
          shineFade={40}
          thickness={2}
          speed={0.35}
          followMouse
          proximity={250}
          autoAnimate
          onClick={() => {
            document.getElementById("menu")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        >
          Get Started
        </SpecularButton>
      </div>
    </section>
  );
};

export default Hero;