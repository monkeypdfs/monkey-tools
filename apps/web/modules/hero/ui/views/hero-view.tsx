import dynamic from "next/dynamic";
import { HeroSection } from "@/modules/hero/ui/components/hero-section";
import { ScrollButton } from "@/modules/hero/ui/components/scroll-button";
import { ImportantToolsSection } from "@/modules/hero/ui/components/important-tools-section";

const CtaSection = dynamic(() => import("@/modules/hero/ui/components/cta-section").then((mod) => mod.CtaSection), {
  loading: () => <div className="w-full h-150 bg-blue-50 dark:bg-blue-900/20 animate-pulse" />,
});

export const HeroView = async () => {
  return (
    <>
      <HeroSection />
      <ImportantToolsSection />
      <CtaSection />
      <ScrollButton />
    </>
  );
};
