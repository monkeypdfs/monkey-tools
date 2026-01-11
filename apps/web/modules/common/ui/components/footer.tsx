import { Logo } from "./logo";
import { caller } from "@/trpc/server";
import Link from "next/link";

export const Footer = async () => {
  // Fetch categories from backend
  const categories = await caller.categories.getMany({});

  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Free, fast, and secure online tools. Your files are automatically deleted after use.
            </p>
          </div>
          <div className="flex flex-wrap gap-12">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Tools</h4>
              <ul className="space-y-2">
                {categories.items.map((category) => (
                  <li key={category._id}>
                    <Link
                      href={`/tools/${category.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/tools" className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
                    View All →
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">© 2026 Monkey.com.br. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
