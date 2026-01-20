"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { PageType } from "@workspace/types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useDeleteCustomPage } from "@/modules/dashboard/hooks/use-delete-custom-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface Page {
  _id: string;
  pageType: PageType;
  slug: string;
  title?: string;
  seoTitle: string;
  isActive: boolean;
  showInFooter?: boolean;
  footerOrder?: number;
}

interface PagesContainerProps {
  pages: Page[];
}

export const PagesContainer = ({ pages }: PagesContainerProps) => {
  const deleteCustomPage = useDeleteCustomPage();

  const fixedPages = pages.filter((p) => p.pageType === PageType.HOMEPAGE || p.pageType === PageType.ALL_TOOLS);
  const customPages = pages.filter((p) => p.pageType === PageType.CUSTOM);

  const handleDelete = (pageId: string, pageTitle: string) => {
    if (confirm(`Are you sure you want to delete "${pageTitle}"?`)) {
      deleteCustomPage.mutate({ id: pageId });
    }
  };

  const getPageEditLink = (page: Page) => {
    if (page.pageType === PageType.HOMEPAGE) {
      return "/dashboard/pages/homepage";
    } else if (page.pageType === PageType.ALL_TOOLS) {
      return "/dashboard/pages/all-tools";
    } else {
      return `/dashboard/pages/custom/${page._id}`;
    }
  };

  const getPageDisplayName = (page: Page) => {
    if (page.pageType === PageType.HOMEPAGE) return "Homepage";
    if (page.pageType === PageType.ALL_TOOLS) return "All Tools";
    return page.title || page.seoTitle;
  };

  return (
    <div className="space-y-6">
      {/* Fixed Pages */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Fixed Pages</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {fixedPages.map((page) => (
            <Card key={page._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{getPageDisplayName(page)}</CardTitle>
                    <CardDescription className="mt-1">/{page.slug}</CardDescription>
                  </div>
                  <Badge variant={page.isActive ? "default" : "secondary"}>{page.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={getPageEditLink(page)}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Pages */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Pages</h3>
        {customPages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No custom pages yet. Create your first custom page!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customPages.map((page) => (
              <Card key={page._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{getPageDisplayName(page)}</CardTitle>
                      <CardDescription className="mt-1">/{page.slug}</CardDescription>
                    </div>
                    <Badge variant={page.isActive ? "default" : "secondary"}>{page.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  {page.showInFooter && (
                    <Badge variant="outline" className="w-fit mt-2">
                      In Footer (Order: {page.footerOrder})
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={getPageEditLink(page)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page._id, getPageDisplayName(page))}
                      disabled={deleteCustomPage.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
