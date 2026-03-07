import { Logo } from "./logo";
import { HeaderNav } from "./header-nav";
import { caller } from "@/trpc/server";

const PDF_CATEGORY_SLUGS = ["pdf-tools", "pdf", "ferramentas-pdf"];
const MAX_NAV_TOOLS = 6;

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
  return pdfCategory.tools.slice(0, MAX_NAV_TOOLS).map((tool) => ({
    _id: tool._id as string,
    name: tool.title,
    href: `/tools/${categorySlug}/${(tool.link as string).replace(/^\//, "")}`,
  }));
}

export const Header = async () => {
  const toolLinks = await getPdfToolLinks();

  return (
    <header className="relative top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="container relative flex items-center justify-between h-16 px-4 mx-auto">
        <Logo />
        <HeaderNav toolLinks={toolLinks} />
        <div className="hidden lg:block shrink-0 w-34.5" aria-hidden="true" />
      </div>
    </header>
  );
};
