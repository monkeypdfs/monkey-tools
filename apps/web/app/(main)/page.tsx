import type { Metadata } from "next";
import { caller } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { NewHeroSection } from "@/modules/hero/ui/components/new-hero-section";
import { TrustSection } from "@/modules/hero/ui/components/trust-section";
import { HomeSeoSection } from "@/modules/hero/ui/components/home-seo-section";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const homepage = await caller.pages.getHomepage();

    return {
      title: homepage.seoTitle,
      description: homepage.seoDescription,
      keywords: homepage.seoKeywords,
      openGraph: {
        title: homepage.seoTitle,
        description: homepage.seoDescription,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: homepage.seoTitle,
        description: homepage.seoDescription,
      },
    };
  } catch {
    // Fallback metadata if page not found
    return {
      title: "Ferramentas PDF Online Grátis – pdfs.com.br",
      description:
        "Ferramentas online gratuitas para comprimir, converter, juntar e dividir PDFs. Rápido, seguro e fácil. Sem cadastro.",
      keywords: "ferramentas PDF, PDF online grátis, comprimir PDF, converter PDF, juntar PDF",
    };
  }
}

const PDF_CATEGORY_SLUGS = ["pdf-tools", "pdf", "ferramentas-pdf"];

export default async function Home() {
  const homepage = await caller.pages.getHomepage();

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
        // keep null
      }
    }
  }

  const allTools =
    pdfCategory?.tools
      .filter((tool) => tool._id)
      .map((tool) => ({
        _id: tool._id as string,
        title: tool.title,
        description: tool.description,
        link: tool.link,
        icon: tool.icon,
        iconColor: tool.iconColor,
        bgColor: tool.bgColor,
        category: {
          _id: pdfCategory._id,
          name: pdfCategory.name,
          slug: pdfCategory.slug,
        },
      })) ?? [];

  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <NewHeroSection heroSection={homepage.heroSection} tools={allTools} />
      <TrustSection />
      <HomeSeoSection />
    </ErrorBoundary>
  );
}
