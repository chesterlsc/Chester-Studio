"use client";

import { ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { contactChannels, socialLinks } from "@/lib/data";
import { Button } from "@/components/ui/Button";

const inputClass =
  "h-12 w-full rounded-md border border-[#262626] bg-[#080808] px-4 text-sm text-white outline-none transition placeholder:text-[#737373] focus:border-[#178BFF] focus:ring-2 focus:ring-[#178BFF]/25";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="section-shell pb-12">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="grid gap-10 rounded-lg border border-[#262626] bg-[#101010]/72 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:p-12">
          <div className="flex flex-col justify-center">
            <h2 className="max-w-lg text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Ready to build a system that supports{" "}
              <span className="text-[#178BFF]">real growth?</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-[#A3A3A3]">
              Tell me about your project and I&apos;ll get back to you within 24 hours.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button href="#contact" variant="primary">
                Start Project
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="#work" variant="secondary">
                View Work
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-10 grid gap-3">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <a
                    key={channel.label}
                    href={channel.href}
                    className="inline-flex w-fit items-center gap-3 text-sm text-[#A3A3A3] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#178BFF]"
                  >
                    <Icon className="h-4 w-4 text-white" />
                    {channel.label}
                  </a>
                );
              })}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4" aria-label="Project inquiry form">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sr-only" htmlFor="name">
                Your Name
              </label>
              <input id="name" name="name" required className={inputClass} placeholder="Your Name" />
              <label className="sr-only" htmlFor="email">
                Email Address
              </label>
              <input id="email" name="email" type="email" required className={inputClass} placeholder="Email Address" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sr-only" htmlFor="business">
                Your Business / Website
              </label>
              <input
                id="business"
                name="business"
                className={inputClass}
                placeholder="Your Business / Website"
              />
              <label className="sr-only" htmlFor="budget">
                Project Budget
              </label>
              <select id="budget" name="budget" className={inputClass} defaultValue="">
                <option value="" disabled>
                  Project Budget
                </option>
                <option>$1,000 - $3,000</option>
                <option>$3,000 - $7,500</option>
                <option>$7,500 - $15,000</option>
                <option>$15,000+</option>
              </select>
            </div>
            <label className="sr-only" htmlFor="message">
              Tell me about your project
            </label>
            <textarea
              id="message"
              name="message"
              required
              className={`${inputClass} min-h-36 resize-y py-4`}
              placeholder="Tell me about your project..."
            />
            <Button type="submit" variant="primary" className="w-full">
              Send Project Inquiry
              <ArrowRight className="h-4 w-4" />
            </Button>
            {submitted ? (
              <p className="rounded-md border border-[#178BFF]/35 bg-[#178BFF]/10 px-4 py-3 text-sm text-[#F5F5F5]">
                Thanks. Your project inquiry is ready for a real submission service when connected.
              </p>
            ) : null}
            <div className="mt-5">
              <p className="mb-3 text-sm text-[#737373]">Follow me</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#262626] bg-[#080808] text-white transition hover:border-[#178BFF] hover:text-[#178BFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#178BFF]"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
