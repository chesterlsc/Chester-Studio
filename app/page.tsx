import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ContactSection } from "@/components/ContactSection";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroOrbit } from "@/components/HeroOrbit";
import { SystemFlow } from "@/components/SystemFlow";
import { ToolEcosystem } from "@/components/ToolEcosystem";
import { WhatIBuild } from "@/components/WhatIBuild";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <Header />
      <main>
        <HeroOrbit />
        <FeaturedProjects />
        <WhatIBuild />
        <SystemFlow />
        <ToolEcosystem />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
