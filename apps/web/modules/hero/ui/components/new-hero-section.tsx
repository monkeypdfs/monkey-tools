import { Zap } from "lucide-react";
import { ToolCard } from "@/modules/common/ui/components/tool-card";

interface HeroSectionContent {
  badge?: string;
  heading?: string;
  headingHighlight?: string;
  description?: string;
}

interface Tool {
  _id: string;
  title: string;
  description: string;
  link: string;
  icon?: string;
  iconColor?: string;
  bgColor?: string;
  category: { _id: unknown; name: string; slug: string };
}

interface NewHeroSectionProps {
  heroSection?: HeroSectionContent;
  tools?: Tool[];
}

export const NewHeroSection = ({ heroSection, tools = [] }: NewHeroSectionProps) => {
  const content = heroSection || {};
  const badge = content.badge ?? "100% gratuito · Sem cadastro · Sem instalação";
  const heading = content.heading ?? "Ferramentas PDF";
  const headingHighlight = content.headingHighlight ?? "Online Grátis";
  const description = content.description ?? "Simples, rápido e seguro. Transforme seus documentos em segundos.";

  return (
    <section className="hero-section py-14 md:py-20">
      <div className="container px-4 mx-auto text-center">
        {/* Badge: light blue bg, subtle blue border, blue text and icon */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-normal mb-6">
          <Zap className="w-4 h-4 text-primary" />
          {badge}
        </div>
        {/* Headline: dark charcoal for main text, solid blue for highlight */}
        <h1 className="mb-4 text-4xl font-black tracking-tight md:text-6xl text-foreground">
          {heading}
          {headingHighlight ? (
            <>
              {" "}
              <span className="text-primary">{headingHighlight}</span>
            </>
          ) : null}
        </h1>
        {/* Subtitle: muted grey, even two-line height */}
        <p className="max-w-md mx-auto mb-12 text-lg leading-relaxed text-muted-foreground min-h-11 line-clamp-2">
          {description}
        </p>

        {/* Tool grid inline (remix style) */}
        <div className="grid max-w-5xl grid-cols-1 gap-5 mx-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool, index) => (
            <ToolCard
              key={tool._id}
              name={tool.title}
              description={tool.description}
              category={tool.category.name}
              categorySlug={tool.category.slug}
              toolSlug={tool.link}
              icon={tool.icon}
              iconColor={tool.iconColor}
              bgColor={tool.bgColor}
              colorIndex={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
