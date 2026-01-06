import { Suspense } from "react";
import { ToolLoading } from "@/modules/common/ui/components/tool-loading";
import { PDFLibProvider } from "@/modules/common/providers/pdf-lib-provider";
import { InvalidToolSelection } from "@/modules/common/ui/components/invalid-tool-selection";

interface ToolViewProps {
  toolCategory: string;
  tool: string;
}

export const ToolView = async ({ toolCategory, tool }: ToolViewProps) => {
  if (!toolCategory || !tool) {
    return <InvalidToolSelection />;
  }

  // const isCategoryValid = TOOLS_CATEGORY_MAP[toolCategory as keyof typeof TOOLS_CATEGORY_MAP];

  // if (!isCategoryValid) {
  //   return <InvalidToolSelection />;
  // }

  // const toolExists = isCategoryValid.find((t) => t.link === `/${toolCategory}/${tool}`);

  // if (!toolExists) {
  //   return <InvalidToolSelection />;
  // }

  try {
    const { default: ToolComponent } = await import(`@/modules/tools/ui/components/${tool}`);

    return (
      <Suspense fallback={<ToolLoading />}>
        <PDFLibProvider>
          <ToolComponent />
        </PDFLibProvider>
      </Suspense>
    );
  } catch {
    return <InvalidToolSelection />;
  }
};
