import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

interface ToolCardProps {
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  toolSlug: string;
  iconColor?: string;
  bgColor?: string;
}

const categoryBorderColors: Record<string, string> = {
  "pdf-tools": "border-[hsl(25_100%_55%)]",
  "image-tools": "border-[hsl(120_100%_55%)]",
  "text-tools": "border-[hsl(200_100%_55%)]",
  "text-ai-tools": "border-[hsl(200_100%_55%)]",
  converters: "border-[hsl(45_100%_55%)]",
};

export const ToolCard = ({ name, description, category, categorySlug, toolSlug }: ToolCardProps) => {
  const borderColor = categoryBorderColors[categorySlug] || "border-primary/30";

  return (
    <Link href={`/tools/${categorySlug}/${toolSlug}`} className="block">
      <div
        className={`bg-card border-2 ${borderColor} rounded-lg p-5 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10`}
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">{category}</span>
        </div>
        <h3 className="mb-2 text-base font-semibold text-foreground">{name}</h3>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-1">{description}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-primary text-primary hover:bg-primary! hover:text-primary-foreground! transition-colors"
        >
          Open tool
        </Button>
      </div>
    </Link>
  );
};
