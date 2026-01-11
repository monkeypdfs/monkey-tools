import { Header } from "@/modules/common/ui/components/header";
import { Footer } from "@/modules/common/ui/components/footer";

export default function HeroLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
