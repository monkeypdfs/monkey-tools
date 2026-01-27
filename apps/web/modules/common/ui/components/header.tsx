import { Button } from "@workspace/ui/components/button";
import { Logo } from "./logo";
import { caller } from "@/trpc/server";
import Link from "next/link";

export const Header = async () => {
  // Fetch categories from backend
  const categories = await caller.categories.getMany({});

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-8">
        {/* Logo */}
        <Logo />

        {/* Category Navigation - Centered */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {categories.items.map((category) => (
            <Link key={category._id} href={`/tools/${category.slug}`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                {category.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/tools">
            <Button size="sm" className="btn-gradient-secondary text-secondary-foreground font-medium">
              Usar Ferramentas
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
