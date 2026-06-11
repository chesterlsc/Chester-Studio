import { navLinks, socialLinks } from "@/lib/data";
import { LogoMark } from "@/components/LogoMark";

export function Footer() {
  return (
    <footer className="border-t border-[#262626] bg-[#030303]">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_1.3fr_1fr] lg:items-center">
        <LogoMark showText />
        <div className="text-sm leading-7 text-[#A3A3A3] lg:text-center">
          <p>
            Interactive digital systems studio helping businesses grow with websites, automation,
            and smart digital systems.
          </p>
          <nav className="mt-4 flex flex-wrap gap-4 lg:justify-center" aria-label="Footer navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-semibold text-[#A3A3A3] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#178BFF]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="mt-4 text-xs text-[#737373]">© 2026 Chester Studio. All rights reserved.</p>
        </div>
        <div className="flex gap-3 lg:justify-end">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-white transition hover:border-[#262626] hover:text-[#178BFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#178BFF]"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
