"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { featuredProjects, projectFilters } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

export function FeaturedProjects() {
  const [activeFilter, setActiveFilter] = useState<(typeof projectFilters)[number]>("All");
  const reducedMotion = useReducedMotion();
  const visibleProjects = useMemo(() => {
    if (activeFilter === "All") return featuredProjects;
    return featuredProjects.filter((project) => project.category === activeFilter);
  }, [activeFilter]);

  return (
    <section id="work" className="section-shell">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeader
          title="FEATURED PROJECTS"
          copy="A collection of websites, automation systems, and digital products."
        />
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {projectFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={[
                "h-10 rounded-md border px-5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#178BFF]",
                activeFilter === filter
                  ? "border-[#178BFF] bg-[#178BFF]/16 text-[#178BFF] shadow-[0_0_22px_rgba(23,139,255,0.18)]"
                  : "border-[#262626] bg-[#080808] text-[#A3A3A3] hover:border-[#3A3A3A] hover:text-white",
              ].join(" ")}
            >
              {filter}
            </button>
          ))}
        </div>
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project) => {
              const Icon = project.icon;
              return (
                <motion.article
                  layout
                  key={project.name}
                  initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: 0.32 }}
                  className="group overflow-hidden rounded-lg border border-[#262626] bg-[#101010]/82 p-2 transition hover:-translate-y-1 hover:border-[#178BFF]/60 hover:bg-[#141414]"
                >
                  <div className="flex gap-4 sm:block">
                    <div className="relative aspect-[1.45] w-[42%] shrink-0 overflow-hidden rounded-md border border-[#262626] bg-[#080808] sm:w-full">
                      <Image
                        src={project.image}
                        alt={`${project.name} project preview`}
                        fill
                        sizes="(max-width: 640px) 44vw, (max-width: 1280px) 33vw, 300px"
                        className="object-cover object-top transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center p-2 sm:p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-white">{project.name}</h3>
                          <p className="mt-1 text-xs leading-5 text-[#A3A3A3]">{project.type}</p>
                        </div>
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#262626] bg-[#080808] text-[#178BFF] transition group-hover:border-[#178BFF]/60">
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                      <p className="mt-3 inline-flex items-center gap-2 text-[11px] text-[#737373]">
                        <Icon className="h-3.5 w-3.5 text-[#178BFF]" />
                        {project.category}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
