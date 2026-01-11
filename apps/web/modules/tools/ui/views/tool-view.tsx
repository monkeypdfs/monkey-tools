import { Suspense } from "react";
import { caller } from "@/trpc/server";
import { ToolSteps } from "@/modules/tools/ui/components/tool-steps";
import { ToolFAQ } from "@/modules/tools/ui/components/tool-faq";
import { FAQSchema } from "@/modules/tools/ui/components/faq-schema";
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

  // Fetch tool data from database
  const category = await caller.categories.getCategoryWithTools({ slug: toolCategory });
  const toolData = category.tools.find((t) => [`/${tool}`, tool].includes(t.link));

  if (!toolData) {
    return <InvalidToolSelection />;
  }

  try {
    const { default: ToolComponent } = await import(`@/modules/tools/ui/components/${tool}`);

    return (
      <div className="container px-4 py-8 mx-auto">
        {/* Ad - Top */}
        <div className="mb-6">
          <AdPlaceholder position="top" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tool Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-2xl font-bold md:text-3xl text-foreground">{toolData.h1Heading || toolData.title}</h1>
              {toolData.introText && <p className="text-muted-foreground">{toolData.introText}</p>}
            </div>

            {/* Tool Card */}
            <div className="p-6 mb-8 border rounded-lg bg-card border-border md:p-8">
              <Suspense fallback={<ToolLoading />}>
                <PDFLibProvider>
                  <ToolComponent />
                </PDFLibProvider>
              </Suspense>
            </div>

            {/* Visual Steps */}
            {toolData.visualSteps && toolData.visualSteps.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-6 text-2xl font-bold">{toolData.stepsTitle || `How to use ${toolData.title}`}</h2>
                <ToolSteps steps={toolData.visualSteps} />
              </div>
            )}

            {/* SEO Content */}
            {toolData.richContent && (
              <div className="mb-8">
                <div className="p-6 border rounded-lg bg-card border-border">
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none 
                      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-4
                      [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-3
                      [&_p]:text-base [&_p]:my-3 [&_p]:leading-relaxed
                      [&_ul]:list-disc! [&_ul]:pl-6! [&_ul]:my-3! 
                      [&_ol]:list-decimal! [&_ol]:pl-6! [&_ol]:my-3! 
                      [&_li]:my-1.5! [&_li]:list-item!
                      [&_strong]:font-semibold [&_em]:italic
                      [&_a]:text-primary [&_a]:underline"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted admin
                    dangerouslySetInnerHTML={{ __html: toolData.richContent }}
                  />
                </div>
              </div>
            )}

            {/* FAQs */}
            {toolData.faqs && toolData.faqs.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
                <ToolFAQ faqs={toolData.faqs} />
                <FAQSchema faqs={toolData.faqs} />
              </div>
            )}

            {/* Closing Text */}
            {toolData.closingText && (
              <div className="mb-8">
                <div className="p-6 border rounded-lg bg-card border-border">
                  <p className="text-base leading-relaxed text-muted-foreground">{toolData.closingText}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block w-72">
            <div className="sticky top-24">
              <AdPlaceholder position="sidebar" />
            </div>
          </div>
        </div>

        {/* Ad - Bottom */}
        <div className="mt-8">
          <AdPlaceholder position="bottom" />
        </div>
      </div>
    );
  } catch {
    return <InvalidToolSelection />;
  }
};
