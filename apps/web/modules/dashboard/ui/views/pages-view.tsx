"use client";

import { PagesHeader } from "@/modules/dashboard/ui/components/pages-header";
import { PagesContainer } from "@/modules/dashboard/ui/components/pages-container";
import { useSuspensePages } from "@/modules/dashboard/hooks/use-suspense-pages";

export const PagesView = () => {
  const { data: pages } = useSuspensePages();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PagesHeader />

      {pages ? <PagesContainer pages={pages} /> : <div className="text-center py-12 text-muted-foreground">No pages found</div>}
    </div>
  );
};
