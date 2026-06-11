"use client";

import { motion, useReducedMotion } from "framer-motion";
import { buildCards } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

export function WhatIBuild() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="build" className="section-shell">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <SectionHeader title="WHAT I BUILD" />
        <div className="grid gap-5 lg:grid-cols-3">
          {buildCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={reducedMotion ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group min-h-[270px] rounded-lg border border-[#262626] bg-[#101010]/88 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-[#178BFF]/45 hover:bg-[#141414]/95 sm:p-10"
              >
                <Icon className="mx-auto h-16 w-16 stroke-[1.4] text-[#3B82F6] transition group-hover:text-[#178BFF]" />
                <h3 className="mt-7 text-2xl font-bold text-white">{card.title}</h3>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#A3A3A3]">{card.copy}</p>
                <p className="mt-5 text-sm text-[#A3A3A3]">
                  <span className="font-semibold text-[#178BFF]">Outcome:</span> {card.outcome}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
