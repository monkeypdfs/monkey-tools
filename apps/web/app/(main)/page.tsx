import type { Metadata } from "next";
import { ErrorBoundary } from "react-error-boundary";
import { caller } from "@/trpc/server";
import { NewHeroSection } from "@/modules/hero/ui/components/new-hero-section";
import { NewToolsGrid } from "@/modules/hero/ui/components/new-tools-grid";
import { HowItWorks } from "@/modules/hero/ui/components/how-it-works";

export const metadata: Metadata = {
  title: "Monkey Tools - Free Online Tools for Everyone",
  description:
    "We offer PDF, text, image and other online tools to make your life easier. Fast, secure, no sign-up required. Convert, compress, merge files in seconds.",
  keywords: "online tools, free tools, pdf tools, image tools, text tools, converter, compressor",
  openGraph: {
    title: "Monkey Tools - Free Online Tools",
    description: "Free PDF, text, and image tools to make your life easier",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monkey Tools - Free Online Tools",
    description: "Free PDF, text, and image tools to make your life easier",
  },
};

export default async function Home() {
  // Fetch categories
  const categories = await caller.categories.getMany({});

  // Fetch 5 tools per category
  const toolsByCategory = await Promise.all(
    categories.items.slice(0, 4).map(async (category) => {
      const tools = await caller.tools.getMany({
        categoryId: category._id,
        pageSize: 5,
        page: 1,
      });
      return {
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug,
        },
        tools: tools.items
          .filter((tool) => tool._id) // Filter out tools without _id
          .map((tool) => ({
            _id: tool._id as string, // Type assertion since we filtered
            title: tool.title,
            description: tool.description,
            link: tool.link,
            category: {
              _id: category._id,
              name: category.name,
              slug: category.slug,
            },
          })),
      };
    }),
  );

  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <NewHeroSection />
      <NewToolsGrid toolsByCategory={toolsByCategory} />
      <HowItWorks />
    </ErrorBoundary>
  );
}
