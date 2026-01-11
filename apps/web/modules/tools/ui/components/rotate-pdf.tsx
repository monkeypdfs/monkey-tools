"use client";

import { toast } from "sonner";
import { degrees, PDFDocument } from "pdf-lib";
import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { MAX_FILE_SIZE } from "@/modules/common/constants";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { usePdfManager } from "@/modules/common/hooks/use-pdf-manager";
import { Download, Plus, Loader2, RotateCw, RotateCcw } from "lucide-react";
import { SelectablePDFGrid } from "@/modules/common/ui/components/selectable-pdf-grid";

export default function RotatePDF() {
  const {
    files,
    pages,
    isProcessing,
    handleFilesSelected,
    removePage,
    rotatePage,
    rotatePages,
    reset: resetManager,
  } = usePdfManager();

  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [rotatedPdf, setRotatedPdf] = useState<Uint8Array | null>(null);

  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
    e.target.value = "";
  };

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

  const handleRotateSelected = (direction: "cw" | "ccw") => {
    if (selectedPages.size === 0) {
      toast.error("Please select pages to rotate.");
      return;
    }
    rotatePages(selectedPages, direction);
  };

  const handleRemovePage = (pageId: string) => {
    removePage(pageId);
    setSelectedPages((prev) => {
      const updated = new Set(prev);
      updated.delete(pageId);
      return updated;
    });
  };

  const savePDF = useCallback(async () => {
    if (pages.length === 0) {
      toast.error("No pages to save.");
      return;
    }

    setIsSaving(true);
    setSaveProgress(0);
    setRotatedPdf(null);

    try {
      const newPdfDoc = await PDFDocument.create();
      const loadedPdfs: Record<string, PDFDocument> = {};

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page) continue;
        const fileItem = files.find((f) => f.id === page.fileId);

        if (!fileItem) continue;

        if (!fileItem.file.size || fileItem.file.size > MAX_FILE_SIZE) {
          toast.error(`File "${fileItem.file.name}" is too large. Maximum file size is 50MB.`);
          setIsSaving(false);
          return;
        }

        if (!loadedPdfs[page.fileId]) {
          const fileBuffer = await fileItem.file.arrayBuffer();
          loadedPdfs[page.fileId] = await PDFDocument.load(fileBuffer);
        }

        const sourcePdf = loadedPdfs[page.fileId];
        if (!sourcePdf) continue;
        const [copiedPage] = await newPdfDoc.copyPages(sourcePdf, [page.pageIndex]);

        if (page.rotation !== 0 && copiedPage) {
          copiedPage.setRotation(degrees(copiedPage.getRotation().angle + page.rotation));
        }

        newPdfDoc.addPage(copiedPage);
        setSaveProgress(((i + 1) / pages.length) * 100);
      }

      const pdfBytes = await newPdfDoc.save();
      setRotatedPdf(pdfBytes);
      toast.success("PDF rotated successfully!");
      setSaveProgress(100);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the PDF.");
    } finally {
      setIsSaving(false);
    }
  }, [files, pages]);

  const downloadPDF = useCallback(() => {
    if (!rotatedPdf) return;
    const blob = new Blob([rotatedPdf as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rotated-pdf-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [rotatedPdf]);

  const reset = useCallback(() => {
    resetManager();
    setSelectedPages(new Set());
    setRotatedPdf(null);
    setSaveProgress(0);
  }, [resetManager]);

  return (
    <div className="w-full">
      {/* Upload Section */}
      <section aria-labelledby="upload-section" className="max-w-5xl mx-auto">
        {pages.length === 0 && !isProcessing ? (
          <FileUpload mode="append" maxFiles={5} onFilesSelected={handleFilesSelected} acceptedFileTypes={["application/pdf"]} />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-xl bg-card">
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
                {selectedPages.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleRotateSelected("ccw")} title="Rotate Left">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRotateSelected("cw")} title="Rotate Right">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 mx-1 bg-border" />
                  </>
                )}

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
                  onClick={reset}
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
      {isSaving && (
        <div className="max-w-3xl mx-auto mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Saving PDF...</span>
            <span className="text-sm text-muted-foreground">{Math.round(saveProgress)}%</span>
          </div>
          <Progress value={saveProgress} className="w-full h-2" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row">
        <Button
          onClick={savePDF}
          disabled={pages.length === 0 || isSaving || isProcessing}
          size="lg"
          className="min-w-40 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          {isSaving ? "Saving..." : "Save PDF"}
        </Button>

        {rotatedPdf && (
          <Button
            onClick={downloadPDF}
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
  );
}
