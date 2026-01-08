"use client";

import { toast } from "sonner";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { HowToStep } from "@/modules/common/ui/components/how-to-step";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Download, Loader2, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";

interface UploadedFile {
  file: File;
  id: string;
}

interface ConversionResult {
  blob: Blob;
  fileName: string;
  sheetCount: number;
}

export default function ExcelToPDF() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // Handle file selection
  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    // Convert to our format
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    }));

    setFiles(uploadedFiles);
    setConversionResult(null); // Reset any previous results
  }, []);

  // Convert Excel to PDF
  const convertToPdf = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setConversionProgress(0);

    try {
      let finalPdfBlob: Blob | null = null;
      let totalSheetCount = 0;
      let processedCount = 0;

      // Dynamically import pdf-lib for merging
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();
      let hasPages = false;

      for (const uploadedFile of files) {
        const arrayBuffer = await uploadedFile.file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        totalSheetCount += workbook.SheetNames.length;

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          if (!sheet) continue;
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Skip empty sheets
          if (!jsonData || jsonData.length === 0) {
            console.warn(`Skipping empty sheet: ${sheetName}`);
            continue;
          }

          console.log(`Processing sheet: ${sheetName}, rows: ${jsonData.length}`);

          // Create PDF directly from data
          const doc = new jsPDF("landscape");

          // Add title
          doc.setFontSize(16);
          doc.text(sheetName, 20, 20);

          // Convert data to table format
          const tableData = jsonData.map((row: unknown) =>
            Array.isArray(row) ? row.map((cell) => String(cell || "")) : [String(row || "")],
          );

          // Simple table rendering
          let yPosition = 30;
          const cellHeight = 8;
          const maxWidth = doc.internal.pageSize.getWidth() - 40;

          tableData.forEach((row) => {
            if (yPosition > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              yPosition = 20;
            }

            row.forEach((cell, colIndex) => {
              const cellText = String(cell);
              const cellWidth = maxWidth / Math.max(row.length, 1);
              const xPosition = 20 + colIndex * cellWidth;

              // Draw cell border
              doc.rect(xPosition, yPosition, cellWidth, cellHeight);

              // Add text (truncated if too long)
              const truncatedText = cellText.length > 15 ? `${cellText.substring(0, 12)}...` : cellText;
              doc.text(truncatedText, xPosition + 2, yPosition + 6);
            });

            yPosition += cellHeight;
          });

          // Debug: Check PDF output
          const pdfOutput = doc.output("dataurlstring");
          console.log(`Generated PDF for sheet ${sheetName}, size: ${pdfOutput.length}`);

          // Merge pages
          const pdfBytes = doc.output("arraybuffer");
          const convertedPdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(convertedPdf, convertedPdf.getPageIndices());

          copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
            hasPages = true;
          });
        }

        processedCount++;
        setConversionProgress((processedCount / files.length) * 100);
      }

      if (hasPages) {
        const mergedPdfBytes = await mergedPdf.save();
        console.log(`Final merged PDF size: ${mergedPdfBytes.length} bytes`);
        finalPdfBlob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      }

      if (!finalPdfBlob) {
        throw new Error("No PDF pages were generated.");
      }

      setConversionResult({
        blob: finalPdfBlob,
        fileName:
          files.length === 1 ? `${files[0]?.file?.name?.replace(/\.xlsx$|\.xls$/i, "")}.pdf` : `excel-merged-${Date.now()}.pdf`,
        sheetCount: totalSheetCount,
      });

      toast.success("PDF created successfully!");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error(error instanceof Error ? error.message : "Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  // Download PDF
  const downloadPdf = useCallback(() => {
    if (!conversionResult) return;

    const url = URL.createObjectURL(conversionResult.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = conversionResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("PDF downloaded!");
  }, [conversionResult]);

  // Reset everything
  const reset = useCallback(() => {
    setFiles([]);
    setConversionResult(null);
    setConversionProgress(0);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Upload Section */}
        <section aria-labelledby="upload-section" className="max-w-3xl mx-auto">
          {files.length === 0 ? (
            <FileUpload
              mode="accumulate"
              maxFiles={5}
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={[
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
              ]}
              label="Upload Excel Files"
              description="Select Excel (.xlsx, .xls) files to convert to PDF"
              disclaimer="Files are processed securely in your browser"
            />
          ) : (
            <div className="space-y-6">
              {/* Files Info */}
              <div className="p-4 border rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {files.length} file{files.length !== 1 ? "s" : ""} selected
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Total size: {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Convert Button */}
              <div className="flex flex-row gap-4">
                <Button
                  onClick={convertToPdf}
                  disabled={isConverting}
                  size="lg"
                  className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Convert to PDF
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={reset} size="lg" className="flex-1">
                  Reset
                </Button>
              </div>

              {/* Conversion Result */}
              {conversionResult && (
                <div className="space-y-4">
                  <div className="p-6 border-2 border-green-300 shadow-lg rounded-xl bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 dark:border-green-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-500 rounded-full">
                        <FileSpreadsheet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-green-800 dark:text-green-200">Conversion Complete!</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">Your PDF is ready for download</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                      <div className="p-3 text-center rounded-lg bg-white/50 dark:bg-black/20">
                        <p className="text-2xl font-bold text-green-600">{conversionResult.sheetCount}</p>
                        <p className="text-sm text-muted-foreground">Sheets Converted</p>
                      </div>
                      <div className="p-3 text-center rounded-lg bg-white/50 dark:bg-black/20">
                        <p className="text-2xl font-bold text-green-600">{formatFileSize(conversionResult.blob.size)}</p>
                        <p className="text-sm text-muted-foreground">File Size</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={downloadPdf}
                        size="lg"
                        className="flex-1 text-white transition-all bg-green-600 shadow-md hover:bg-green-700 hover:shadow-lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" onClick={reset} size="lg" className="flex-1">
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Progress Bar */}
        {isConverting && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Converting spreadsheets to PDF...</span>
              <span className="text-sm text-muted-foreground">{Math.round(conversionProgress)}%</span>
            </div>
            <Progress value={conversionProgress} className="w-full h-2" />
          </div>
        )}

        {/* Warning */}
        <Alert className="max-w-3xl mx-auto mt-6 text-blue-800 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-200">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          <AlertTitle>Conversion Notice</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Excel sheets are converted to PDF in landscape orientation to fit more columns.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
