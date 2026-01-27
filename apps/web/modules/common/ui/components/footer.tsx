import { Logo } from "./logo";
import Link from "next/link";
import { caller } from "@/trpc/server";

export const Footer = async () => {
  // Fetch categories and custom pages from backend
  const [categories, customPages] = await Promise.all([caller.categories.getMany({}), caller.pages.getFooterPages()]);

  return (
    <footer className="py-12 border-t bg-card border-border">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col justify-between max-w-6xl gap-12 mx-auto md:flex-row">
          {/* Logo and Description */}
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Ferramentas online gratuitas, rápidas e seguras. Parte da plataforma DesignOnline.
            </p>
          </div>

          <div className="flex gap-12 md:gap-24">
            {/* Ferramentas Section - Dynamic from Categories */}
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Ferramentas</h4>
              <ul className="space-y-2">
                {categories.items.slice(0, 4).map((category) => (
                  <li key={category._id}>
                    <Link
                      href={`/tools/${category.slug}`}
                      className="text-sm transition-colors text-muted-foreground hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Section - Dynamic from Custom Pages */}
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2">
                {customPages.map((page) => (
                  <li key={page._id}>
                    <Link href={`/${page.slug}`} className="text-sm transition-colors text-muted-foreground hover:text-primary">
                      {page.footerLabel || page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="flex flex-col items-center justify-between max-w-6xl gap-4 pt-6 mx-auto mt-12 border-t border-border md:flex-row">
          <p className="text-sm text-muted-foreground">© 2026 Monkey.com.br. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
