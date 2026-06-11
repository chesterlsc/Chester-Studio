"use client";

import { Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { navLinks } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/LogoMark";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#262626]/80 bg-[#030303]/82 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <a
          href="#top"
          className="rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#178BFF]"
          aria-label="Chester Studio home"
        >
          <LogoMark showText />
        </a>
        <nav aria-label="Primary navigation" className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-white transition hover:text-[#178BFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#178BFF]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button href="#contact" variant="secondary" className="border-[#FFD43B]/70 text-[#FFD43B]">
            Start Project
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#262626] bg-[#101010] text-white transition hover:border-[#178BFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#178BFF] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div id="mobile-menu" className="border-t border-[#262626] bg-[#030303] px-5 py-5 lg:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto grid max-w-[1280px] gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#101010] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#178BFF]"
              >
                {link.label}
              </a>
            ))}
            <Button href="#contact" variant="primary" className="mt-3 w-full" onClick={() => setOpen(false)}>
              Start Project
              <ArrowRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
