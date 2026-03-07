import { Suspense } from "react";
import { caller } from "@/trpc/server";
import { ToolSteps } from "@/modules/tools/ui/components/tool-steps";
import { ToolFAQ } from "@/modules/tools/ui/components/tool-faq";
import { FAQSchema } from "@/modules/tools/ui/components/faq-schema";
import { RelatedTools } from "@/modules/tools/ui/components/related-tools";
import { SoftwareSchema } from "@/modules/tools/ui/components/software-schema";
import { BreadcrumbSchema } from "@/modules/tools/ui/components/breadcrumb-schema";
import { ToolPageHeader } from "@/modules/tools/ui/components/tool-page-header";
import { ToolLoading } from "@/modules/common/ui/components/tool-loading";
import { PDFLibProvider } from "@/modules/common/providers/pdf-lib-provider";
import { InvalidToolSelection } from "@/modules/common/ui/components/invalid-tool-selection";
import { AdPlaceholder } from "@/modules/common/ui/components/ad-placeholder";

interface ToolViewProps {
  toolCategory: string;
  tool: string;
}

export const ToolView = async ({ toolCategory, tool }: ToolViewProps) => {
  if (!toolCategory || !tool) {
    return <InvalidToolSelection />;
  }

  const category = await caller.categories.getCategoryWithTools({ slug: toolCategory });
  const toolData = category.tools.find((t) => [`/${tool}`, tool].includes(t.link));

  if (!toolData) {
    return <InvalidToolSelection />;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://monkeytools.com";
    const currentUrl = `${baseUrl}/tools/${toolCategory}/${tool}`;

    const { default: ToolComponent } = await import(`@/modules/tools/ui/components/${tool}`);

    const title = toolData.h1Heading || toolData.title;
    const description = toolData.introText || toolData.description;

    return (
      <div className="container px-4 mx-auto">
        <SoftwareSchema tool={toolData} url={currentUrl} />
        <BreadcrumbSchema
          items={[
            { name: "Home", url: baseUrl },
            { name: category.name, url: `${baseUrl}/tools/${toolCategory}` },
            { name: toolData.title, url: currentUrl },
          ]}
        />

        {/* Above the fold: centered header (remix style) */}
        <ToolPageHeader
          title={title}
          description={description}
          iconName={toolData.icon ?? undefined}
          categorySlug={toolCategory}
        />

        <div className="max-w-2xl mx-auto mb-6">
          <AdPlaceholder position="top" />
        </div>

        {/* Tool area - centered */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="p-6 border md:p-8 rounded-2xl bg-card border-border">
            <Suspense fallback={<ToolLoading />}>
              <PDFLibProvider>
                <ToolComponent />
              </PDFLibProvider>
            </Suspense>
          </div>
        </div>

        {/* Below the fold: single column max-w-3xl, seo-section cards */}
        <div className="max-w-3xl pb-8 mx-auto space-y-8">
          <AdPlaceholder position="bottom" />

          {/* Visual Steps */}
          {toolData.visualSteps && toolData.visualSteps.length > 0 && (
            <div className="seo-section">
              <h2 className="mb-4 text-xl font-bold text-foreground">{toolData.stepsTitle ?? `How to use ${toolData.title}`}</h2>
              <ToolSteps steps={toolData.visualSteps} />
            </div>
          )}

          {/* SEO / Rich Content */}
          {toolData.richContent && (
            <div className="seo-section">
              <div
                className="prose prose-sm max-w-none text-muted-foreground leading-relaxed
                  [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                  [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                  [&_p]:mb-4 [&_ul]:mb-4 [&_li]:mb-1 [&_strong]:text-foreground
                  [&_a]:text-primary [&_a]:underline"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted admin
                dangerouslySetInnerHTML={{ __html: toolData.richContent }}
              />
            </div>
          )}

          {/* FAQs */}
          {toolData.faqs && toolData.faqs.length > 0 && (
            <div className="seo-section">
              <h2 className="mb-4 text-xl font-bold text-foreground">Perguntas Frequentes</h2>
              <ToolFAQ faqs={toolData.faqs} />
              <FAQSchema faqs={toolData.faqs} />
            </div>
          )}

          {/* Closing Text */}
          {toolData.closingText && (
            <div className="seo-section">
              <p className="text-base leading-relaxed text-muted-foreground">{toolData.closingText}</p>
            </div>
          )}

          {/* Related Tools - remix style */}
          <RelatedTools currentToolId={toolData._id as string} tools={category.tools} categorySlug={toolCategory} />
        </div>
      </div>
    );
  } catch {
    return <InvalidToolSelection />;
  }
};
