import Link from "next/link";
import { Search, Gamepad2 } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

interface HeroSectionContent {
  badge: string;
  heading: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

interface NewHeroSectionProps {
  heroSection?: HeroSectionContent;
}

export const NewHeroSection = ({ heroSection }: NewHeroSectionProps) => {
  // Fallback to default content if not provided
  const content = heroSection || {
    badge: "Seu QG para ferramentas grátis",
    heading: "Escolha suas ferramentas!",
    description:
      "As melhores ferramentas gratuitas para você usar com segurança: deletamos seus arquivos assim que você terminar de usar as ferramentas. Você se beneficia porque é seguro.",
    primaryButtonText: "Começar agora",
    primaryButtonLink: "#tools",
    secondaryButtonText: "Ver todas as ferramentas",
    secondaryButtonLink: "/tools",
  };

  return (
    <section className="relative py-20 overflow-hidden md:py-32 bg-background">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 rounded-full left-1/4 w-96 h-96 bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 rounded-full right-1/4 w-80 h-80 bg-secondary/10 blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border rounded-full bg-card border-border">
          <Gamepad2 className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">{content.badge}</span>
        </div>
        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-foreground">{content.heading}</h1>
        <p className="max-w-3xl mx-auto mb-10 text-lg md:text-xl text-muted-foreground">{content.description}</p>
        <div className="flex flex-col justify-center gap-4 mb-8 sm:flex-row">
          <Link href={content.primaryButtonLink}>
            <Button
              size="lg"
              className="h-auto px-8 py-6 text-base font-semibold rounded-xl btn-gradient-secondary text-secondary-foreground"
            >
              <Gamepad2 className="w-5 h-5" />
              {content.primaryButtonText}
            </Button>
          </Link>
          <Link href={content.secondaryButtonLink}>
            <Button
              size="lg"
              variant="outline"
              className="h-auto px-8 py-6 text-base font-medium rounded-xl border-border hover:bg-card text-foreground"
            >
              {content.secondaryButtonText}
            </Button>
          </Link>
        </div>
        <div className="relative max-w-xl mx-auto md:hidden">
          <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-muted-foreground" />
          <Input placeholder="Buscar ferramenta..." className="h-12 pl-12 text-base bg-card border-border" />
        </div>
      </div>
    </section>
  );
};
