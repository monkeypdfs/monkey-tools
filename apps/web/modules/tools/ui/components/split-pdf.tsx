"use client";

import { toast } from "sonner";
import { degrees, PDFDocument } from "pdf-lib";
import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Download, Plus, Loader2 } from "lucide-react";
import { MAX_FILE_SIZE } from "@/modules/common/constants";
import { Progress } from "@workspace/ui/components/progress";
import { usePdfManager } from "@/modules/common/hooks/use-pdf-manager";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";
import { SelectablePDFGrid } from "@/modules/common/ui/components/selectable-pdf-grid";

export default function SplitPDF() {
  const { files, pages, isProcessing, handleFilesSelected, removePage, rotatePage, reset: resetManager } = usePdfManager();

  const [isSplitting, setIsSplitting] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [splitPdf, setSplitPdf] = useState<Uint8Array | null>(null);

  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const handleRemovePage = useCallback(
    (pageId: string) => {
      removePage(pageId);
      setSelectedPages((prev) => {
        const updated = new Set(prev);
        updated.delete(pageId);
        return updated;
      });
    },
    [removePage],
  );

  const handleSelectPage = useCallback((pageId: string, selected: boolean) => {
    setSelectedPages((prev) => {
      const updated = new Set(prev);
      if (selected) {
        updated.add(pageId);
      } else {
        updated.delete(pageId);
      }
      return updated;
    });
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedPages(new Set(pages.map((p) => p.id)));
      } else {
        setSelectedPages(new Set());
      }
    },
    [pages],
  );

  const splitPDF = useCallback(async () => {
    if (selectedPages.size === 0) {
      toast.error("Please select at least one page to split.");
      return;
    }

    setIsSplitting(true);
    setSplitProgress(0);
    setSplitPdf(null);

    try {
      const splitPdfDoc = await PDFDocument.create();
      const loadedPdfs: Record<string, PDFDocument> = {};

      const selectedPagesList = Array.from(pages).filter((p) => selectedPages.has(p.id));

      for (let i = 0; i < selectedPagesList.length; i++) {
        const page = selectedPagesList[i];
        if (!page) continue;
        const fileItem = files.find((f) => f.id === page.fileId);

        if (!fileItem) continue;

        // Validate file size before loading
        if (!fileItem.file.size || fileItem.file.size > MAX_FILE_SIZE) {
          toast.error(`File "${fileItem.file.name}" is too large. Maximum file size is 50MB.`);
          setIsSplitting(false);
          return;
        }

        // Load PDF if not already loaded
        if (!loadedPdfs[page.fileId]) {
          const fileBuffer = await fileItem.file.arrayBuffer();
          loadedPdfs[page.fileId] = await PDFDocument.load(fileBuffer);
        }

        const sourcePdf = loadedPdfs[page.fileId];
        if (!sourcePdf) continue;
        const [copiedPage] = await splitPdfDoc.copyPages(sourcePdf, [page.pageIndex]);

        if (page.rotation !== 0 && copiedPage) {
          copiedPage.setRotation(degrees(copiedPage.getRotation().angle + page.rotation));
        }

        splitPdfDoc.addPage(copiedPage);
        setSplitProgress(((i + 1) / selectedPagesList.length) * 100);
      }

      const splitPdfBytes = await splitPdfDoc.save();
      setSplitPdf(splitPdfBytes);
      toast.success("PDF split successfully!");
      setSplitProgress(100);
    } catch {
      toast.error("An error occurred while splitting the PDF.");
    } finally {
      setIsSplitting(false);
    }
  }, [files, pages, selectedPages]);

  const downloadSplitPDF = useCallback(() => {
    if (!splitPdf) return;
    const blob = new Blob([splitPdf as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `split-pdf-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [splitPdf]);

  const resetSplit = useCallback(() => {
    resetManager();
    setSelectedPages(new Set());
    setSplitProgress(0);
    setSplitPdf(null);
  }, [resetManager]);

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Upload Section */}
        <section aria-labelledby="upload-section" className="max-w-5xl mx-auto">
          {pages.length === 0 && !isProcessing ? (
            <FileUpload
              mode="append"
              maxFiles={5}
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={["application/pdf"]}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">
                    {pages.length} Page{pages.length !== 1 ? "s" : ""}
                  </h3>

                  {isProcessing && (
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="application/pdf"
                      onChange={handleAddMore}
                      className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                      title="Add more files"
                    />
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Files
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSplit}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Pages Grid with Selection */}
              <SelectablePDFGrid
                pages={pages}
                selectedPages={selectedPages}
                onSelectPage={handleSelectPage}
                onSelectAll={handleSelectAll}
                onRotate={(id) => rotatePage(id, "cw")}
                onRemove={handleRemovePage}
              />
            </div>
          )}
        </section>

        {/* Progress Bar */}
        {isSplitting && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Extracting Pages...</span>
              <span className="text-sm text-muted-foreground">{Math.round(splitProgress)}%</span>
            </div>
            <Progress value={splitProgress} className="w-full h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row">
          <Button
            onClick={splitPDF}
            disabled={pages.length === 0 || selectedPages.size === 0 || isSplitting || isProcessing}
            size="lg"
            className="min-w-40 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {isSplitting ? "Extracting..." : "Split PDF"}
          </Button>

          {splitPdf && (
            <Button
              onClick={downloadSplitPDF}
              variant="outline"
              size="lg"
              className="text-blue-700 border-blue-200 min-w-40 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/40"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
