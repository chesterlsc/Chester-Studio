"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { systemSteps } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

export function SystemFlow() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="system" className="section-shell">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <SectionHeader
          title="THE SYSTEM BEHIND THE WEBSITE"
          copy="Websites are just the beginning. Here is how I turn traffic into growth."
        />
        <div className="hidden items-start justify-between gap-4 lg:flex">
          {systemSteps.map((step, index) => {
            const Icon = step.icon;
            const isGrowth = step.accent === "yellow";
            return (
              <div key={step.label} className="flex flex-1 items-center">
                <motion.div
                  className="group flex flex-1 flex-col items-center text-center"
                  initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <div
                    className={[
                      "flex h-20 w-20 items-center justify-center rounded-full border bg-[#101010] transition group-hover:scale-105",
                      isGrowth
                        ? "border-[#FFD43B]/60 text-[#FFD43B]"
                        : "border-[#3A3A3A] text-[#F5F5F5] group-hover:border-[#178BFF]/70 group-hover:text-[#178BFF]",
                    ].join(" ")}
                  >
                    <Icon className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{step.label}</h3>
                  <p className="mt-2 min-h-10 text-xs leading-5 text-[#737373] opacity-0 transition group-hover:opacity-100">
                    {step.description}
                  </p>
                </motion.div>
                {index < systemSteps.length - 1 ? (
                  <motion.div
                    className="mx-1 mt-9 h-px w-10 bg-[#178BFF]"
                    initial={reducedMotion ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.09 + 0.2 }}
                  >
                    <ArrowRight className="-mt-2 ml-auto h-4 w-4 text-[#178BFF]" />
                  </motion.div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mx-auto max-w-xl lg:hidden">
          <div className="relative pl-14">
            <div className="absolute left-6 top-8 h-[calc(100%-64px)] w-px bg-gradient-to-b from-[#178BFF] via-[#178BFF]/50 to-[#FFD43B]" />
            {systemSteps.map((step, index) => {
              const Icon = step.icon;
              const isGrowth = step.accent === "yellow";
              return (
                <motion.div
                  key={step.label}
                  className="relative pb-8"
                  initial={reducedMotion ? false : { opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                >
                  <div
                    className={[
                      "absolute -left-14 flex h-12 w-12 items-center justify-center rounded-full border bg-[#080808]",
                      isGrowth ? "border-[#FFD43B]/70 text-[#FFD43B]" : "border-[#178BFF]/70 text-[#178BFF]",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={["text-lg font-bold", isGrowth ? "text-[#FFD43B]" : "text-white"].join(" ")}>
                    {step.label}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#A3A3A3]">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
