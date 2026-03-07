import Link from "next/link";
import { caller } from "@/trpc/server";

const PDF_CATEGORY_SLUGS = ["pdf-tools", "pdf", "ferramentas-pdf"];
const FIRST_COLUMN_TOOLS = 4;
const SECOND_COLUMN_TOOLS = 4;

async function getPdfToolLinks(): Promise<Array<{ _id: string; name: string; href: string }>> {
  let pdfCategory: Awaited<ReturnType<typeof caller.categories.getCategoryWithTools>> | null = null;
  for (const slug of PDF_CATEGORY_SLUGS) {
    try {
      pdfCategory = await caller.categories.getCategoryWithTools({ slug });
      break;
    } catch {
      console.error(`Category with slug "${slug}" not found.`);
    }
  }
  if (!pdfCategory) {
    const { items: categories } = await caller.categories.getMany({});
    const pdfBySlug = categories.find((c) => c.slug.toLowerCase().includes("pdf"));
    if (pdfBySlug) {
      try {
        pdfCategory = await caller.categories.getCategoryWithTools({ slug: pdfBySlug.slug });
      } catch {
        return [];
      }
    } else {
      return [];
    }
  }
  const categorySlug = pdfCategory.slug;
  const maxTools = FIRST_COLUMN_TOOLS + SECOND_COLUMN_TOOLS;
  return pdfCategory.tools.slice(0, maxTools).map((tool) => ({
    _id: tool._id as string,
    name: tool.title,
    href: `/tools/${categorySlug}/${(tool.link as string).replace(/^\//, "")}`,
  }));
}

export const Footer = async () => {
  const [toolLinks, customPages] = await Promise.all([getPdfToolLinks(), caller.pages.getFooterPages()]);

  return (
    <footer className="border-t bg-card py-10 mt-16">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-bold mb-4 text-foreground">Ferramentas PDF</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              {toolLinks.slice(0, FIRST_COLUMN_TOOLS).map((link) => (
                <li key={link._id}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">Mais Ferramentas</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              {toolLinks.slice(FIRST_COLUMN_TOOLS, FIRST_COLUMN_TOOLS + SECOND_COLUMN_TOOLS).map((link) => (
                <li key={link._id}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              {customPages.map((page) => (
                <li key={page._id}>
                  <Link href={`/${page.slug}`} className="hover:text-primary transition-colors">
                    {page.footerLabel || page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">Sobre</h4>
            <p className="text-muted-foreground leading-relaxed">
              Ferramentas online gratuitas, rápidas e seguras. Sem cadastro necessário.
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} pdfs.com.br — Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
