import { Footer } from "@/modules/hero/ui/components/footer";
import { HeroNavbar } from "@/modules/hero/ui/components/hero-navbar";

export default function HeroLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeroNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
