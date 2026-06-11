"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function AnimatedBackground() {
  const reducedMotion = useReducedMotion();
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);
  const glowX = useSpring(mouseX, { stiffness: 70, damping: 25 });
  const glowY = useSpring(mouseY, { stiffness: 70, damping: 25 });

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030303]"
      onPointerMove={(event) => {
        if (reducedMotion) return;
        mouseX.set(event.clientX - 180);
        mouseY.set(event.clientY - 180);
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0b1730_0%,#030303_42%,#030303_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(23,139,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(23,139,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
      <div className="absolute inset-0 stars-layer" />
      {!reducedMotion ? (
        <motion.div
          className="absolute h-96 w-96 rounded-full bg-[#178BFF]/10 blur-3xl"
          style={{ x: glowX, y: glowY }}
        />
      ) : null}
      <motion.div
        className="absolute left-1/2 top-24 h-[620px] w-[620px] -translate-x-1/2 rounded-full border border-[#178BFF]/15"
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-40 h-[760px] w-[760px] -translate-x-1/2 rounded-full border border-[#178BFF]/10"
        animate={reducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
