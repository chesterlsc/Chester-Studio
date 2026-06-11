"use client";

import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { heroRoles, orbitProjects } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/LogoMark";

const orbitPositions: Record<string, string> = {
  leftTop: "left-[6%] top-[4%] sm:left-[13%] sm:top-[1%] lg:left-[10%] lg:top-[4%]",
  leftMid: "left-[1%] top-[36%] sm:left-[6%] sm:top-[34%] lg:left-[2%] lg:top-[35%]",
  leftBottom: "left-[12%] bottom-[6%] sm:left-[15%] sm:bottom-[7%] lg:left-[11%] lg:bottom-[12%]",
  rightTop: "right-[6%] top-[4%] sm:right-[13%] sm:top-[1%] lg:right-[10%] lg:top-[4%]",
  rightMid: "right-[1%] top-[36%] sm:right-[6%] sm:top-[34%] lg:right-[2%] lg:top-[35%]",
  rightBottom: "right-[12%] bottom-[6%] sm:right-[15%] sm:bottom-[7%] lg:right-[11%] lg:bottom-[12%]",
};

function useRoleLoop() {
  const reducedMotion = useReducedMotion();
  const [roleIndex, setRoleIndex] = useState(1);

  useEffect(() => {
    if (reducedMotion) return;

    const interval = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % heroRoles.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  return { reducedMotion, role: heroRoles[roleIndex], roleIndex };
}

export function HeroOrbit() {
  const { role, roleIndex, reducedMotion } = useRoleLoop();

  return (
    <section id="top" className="section-shell relative min-h-screen overflow-hidden !pb-8 !pt-28 sm:!pt-32">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <motion.div
          className="relative z-10 mx-auto max-w-3xl text-center"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#178BFF]">
            HELLO, WELCOME TO CHESTER STUDIO
          </p>
          <h1 className="mt-3 text-5xl font-black tracking-normal text-white sm:text-6xl lg:text-7xl">
            I&apos;m Chester.
          </h1>
          <div className="mx-auto mt-5 max-w-xl">
            <div className="role-frame">
              <div
                className="relative flex h-10 items-center justify-center overflow-hidden text-lg font-bold text-[#178BFF] sm:h-12 sm:text-2xl"
                aria-live="polite"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`${role}-${roleIndex}`}
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute inset-x-0 text-center"
                  >
                    {role}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white sm:text-lg">
            I help businesses build better websites, automate repetitive work, and create digital
            systems that support real growth.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="#contact" variant="primary">
              Start Project
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#work" variant="secondary">
              View Work
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-[#A3A3A3]">
            <span className="h-2 w-2 rounded-full bg-[#178BFF] shadow-[0_0_18px_rgba(23,139,255,0.9)]" />
            Currently Building at Chester Studio
          </p>
        </motion.div>

        <div className="hero-orbit relative mx-auto mt-4 h-[430px] max-w-[1040px] sm:h-[470px] lg:-mt-40 lg:h-[560px]">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[64%] w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-[#178BFF]/20"
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 82, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[42%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-[#178BFF]/12"
            animate={reducedMotion ? undefined : { rotate: -360 }}
            transition={{ duration: 96, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute left-1/2 top-[51%] h-32 w-[58%] -translate-x-1/2 rounded-[100%] border border-[#178BFF]/30 blur-[1px]" />
          <motion.div
            className="absolute left-1/2 top-[51%] -translate-x-1/2 -translate-y-1/2"
            animate={reducedMotion ? undefined : { scale: [1, 1.018, 1] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <LogoMark size="xl" />
          </motion.div>
          {orbitProjects.map((project, index) => {
            return (
              <motion.div
                key={project.name}
                className={[
                  "orbit-card absolute w-24 rounded-lg border border-[#3A3A3A] bg-[#101010]/88 p-3 text-center shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-[#178BFF]/55 sm:w-32 sm:p-4",
                  orbitPositions[project.position],
                ].join(" ")}
                animate={reducedMotion ? undefined : { y: [0, index % 2 ? -10 : 10, 0] }}
                transition={{
                  duration: 4.5 + index * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {project.logo ? (
                  <Image
                    src={project.logo}
                    alt={project.logoAlt}
                    width={84}
                    height={56}
                    className="mx-auto h-8 w-auto object-contain sm:h-10"
                  />
                ) : (
                  // Official project logo asset slot. Add the real logo to public/logos and set project.logo in lib/data.ts.
                  <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-md border border-[#262626] text-xs font-bold text-[#737373] sm:h-10 sm:w-10">
                    —
                  </span>
                )}
                <p className="mt-2 text-xs font-bold text-white sm:text-sm">{project.name}</p>
                <p className="text-[10px] text-[#A3A3A3] sm:text-xs">{project.detail}</p>
              </motion.div>
            );
          })}
          <a
            href="#work"
            className="absolute bottom-0 left-1/2 inline-flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-[#262626] bg-[#080808] text-white transition hover:border-[#178BFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#178BFF]"
            aria-label="Scroll to featured projects"
          >
            <ArrowDown className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
