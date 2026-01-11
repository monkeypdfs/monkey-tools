"use client";

import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { useState, useCallback } from "react";
import { degrees, PDFDocument } from "pdf-lib";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { MAX_FILE_SIZE } from "@/modules/common/constants";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { usePdfManager } from "@/modules/common/hooks/use-pdf-manager";
import type { UploadedFile } from "@/modules/common/hooks/use-pdf-manager";
import { Download, Trash2, Plus, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { type PDFPage, SortablePDFGrid } from "@/modules/common/ui/components/sortable-pdf-grid";

export default function MergePDF() {
  const {
    files,
    setFiles,
    pages,
    setPages,
    isProcessing,
    handleFilesSelected,
    removePage,
    rotatePage,
    reset: resetManager,
  } = usePdfManager();

  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergedPdf, setMergedPdf] = useState<Uint8Array | null>(null);
  const [viewMode, setViewMode] = useState<"pages" | "files">("files");

  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  // File-level operations for 'files' view
  const moveFile = useCallback(
    (index: number, direction: "up" | "down") => {
      const newFiles = [...files];
      if (direction === "up" && index > 0) {
        const item = newFiles.splice(index, 1)[0] as UploadedFile;
        newFiles.splice(index - 1, 0, item);
      } else if (direction === "down" && index < newFiles.length - 1) {
        const item = newFiles.splice(index, 1)[0] as UploadedFile;
        newFiles.splice(index + 1, 0, item);
      }
      setFiles(newFiles);

      // Recompute pages order to follow files order (stable within-file)
      const pagesByFile: Record<string, PDFPage[]> = {};
      pages.forEach((p) => {
        const filePages = pagesByFile[p.fileId];
        if (!filePages) {
          pagesByFile[p.fileId] = [p];
        } else {
          filePages.push(p);
        }
      });

      const newOrderedPages: PDFPage[] = [];
      newFiles.forEach((f) => {
        const arr = pagesByFile[f.id] || [];
        newOrderedPages.push(...arr);
      });

      setPages(newOrderedPages);
    },
    [files, pages, setFiles, setPages],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setPages((prev) => prev.filter((p) => p.fileId !== fileId));
    },
    [setFiles, setPages],
  );

  const mergePDFs = useCallback(async () => {
    if (pages.length === 0) {
      toast.error("No pages to merge.");
      return;
    }

    setIsMerging(true);
    setMergeProgress(0);
    setMergedPdf(null);

    try {
      const mergedPdfDoc = await PDFDocument.create();

      // Cache loaded PDFs to avoid reloading for every page
      const loadedPdfs: Record<string, PDFDocument> = {};

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        if (!page) continue;

        const fileItem = files.find((f) => f.id === page.fileId);

        if (!fileItem) continue;

        // Validate file size before loading
        if (!fileItem.file.size || fileItem.file.size > MAX_FILE_SIZE) {
          toast.error(`File "${fileItem.file.name}" is too large to merge. Maximum file size is 50MB.`);
          setIsMerging(false);
          return;
        }

        // Load PDF if not already loaded
        if (!loadedPdfs[page.fileId]) {
          const fileBuffer = await fileItem.file.arrayBuffer();
          loadedPdfs[page.fileId] = await PDFDocument.load(fileBuffer);
        }

        const sourcePdf = loadedPdfs[page.fileId];
        if (!sourcePdf) continue;
        const [copiedPage] = await mergedPdfDoc.copyPages(sourcePdf, [page.pageIndex]);

        if (page.rotation !== 0 && copiedPage) {
          copiedPage.setRotation(degrees(copiedPage.getRotation().angle + page.rotation));
        }

        mergedPdfDoc.addPage(copiedPage);
        setMergeProgress(((i + 1) / pages.length) * 100);
      }

      const mergedPdfBytes = await mergedPdfDoc.save();
      setMergedPdf(mergedPdfBytes);
      toast.success("PDFs merged successfully!");
      setMergeProgress(100);
    } catch {
      toast.error("An error occurred while merging PDFs.");
    } finally {
      setIsMerging(false);
    }
  }, [files, pages]);

  const downloadMergedPDF = useCallback(() => {
    if (!mergedPdf) return;
    const blob = new Blob([mergedPdf as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `merged-pdf-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [mergedPdf]);

  const resetMerge = useCallback(() => {
    resetManager();
    setMergedPdf(null);
    setMergeProgress(0);
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
                <div className="inline-flex items-center p-1 rounded-md bg-muted/40">
                  <button
                    type="button"
                    onClick={() => setViewMode("pages")}
                    className={cn(
                      "px-3 py-1 text-sm rounded-md",
                      viewMode === "pages" ? "bg-white dark:bg-gray-800 shadow" : "hover:bg-muted/60",
                    )}
                  >
                    Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("files")}
                    className={cn(
                      "px-3 py-1 text-sm rounded-md",
                      viewMode === "files" ? "bg-white dark:bg-gray-800 shadow" : "hover:bg-muted/60",
                    )}
                  >
                    Files
                  </button>
                </div>

                <h3 className="text-lg font-semibold">
                  {viewMode === "pages"
                    ? `${pages.length} Page${pages.length !== 1 ? "s" : ""}`
                    : `${files.length} File${files.length !== 1 ? "s" : ""}`}
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
                  onClick={resetMerge}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Pages Grid with Drag and Drop OR File-level reordering */}
            {viewMode === "pages" ? (
              <SortablePDFGrid
                pages={pages}
                onPagesChange={setPages}
                onRotate={(id) => rotatePage(id, "cw")}
                onRemove={removePage}
              />
            ) : (
              <div className="space-y-3">
                {files.map((f, idx) => {
                  const count = pages.filter((p) => p.fileId === f.id).length;
                  return (
                    <div
                      key={f.id}
                      className="flex items-center justify-between gap-4 p-3 bg-white border rounded-lg shadow-sm dark:bg-card border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                          <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <title>File Icon</title>
                            <path
                              d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="max-w-xs font-medium truncate">{f.file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {count} page{count !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => moveFile(idx, "up")}
                          disabled={idx === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => moveFile(idx, "down")}
                          disabled={idx === files.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" className="w-8 h-8" onClick={() => removeFile(f.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Progress Bar */}
      {isMerging && (
        <div className="max-w-3xl mx-auto mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Merging Pages...</span>
            <span className="text-sm text-muted-foreground">{Math.round(mergeProgress)}%</span>
          </div>
          <Progress value={mergeProgress} className="w-full h-2" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row">
        <Button
          onClick={mergePDFs}
          disabled={pages.length === 0 || isMerging || isProcessing}
          size="lg"
          className="min-w-40 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          {isMerging ? "Merging..." : "Merge PDF"}
        </Button>

        {mergedPdf && (
          <Button
            onClick={downloadMergedPDF}
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
