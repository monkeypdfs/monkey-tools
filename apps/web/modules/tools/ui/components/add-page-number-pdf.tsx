"use client";

import { toast } from "sonner";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Slider } from "@workspace/ui/components/slider";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Download, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";

type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type Margin = "small" | "recommended" | "large";

interface PageNumberSettings {
  fontFamily: string;
  fontSize: number;
  opacity: number;
  position: Position;
  margin: Margin;
  firstNumber: number;
  pageRange: {
    from: number;
    to: number;
  };
}

const marginValues = {
  small: 30,
  recommended: 50,
  large: 80,
};

export default function AddPageNumberPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Local state for input fields to allow free typing
  const [fromInput, setFromInput] = useState<string>("1");
  const [toInput, setToInput] = useState<string>("1");
  const [firstNumberInput, setFirstNumberInput] = useState<string>("1");

  const [settings, setSettings] = useState<PageNumberSettings>({
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    opacity: 1,
    position: "bottom-right",
    margin: "recommended",
    firstNumber: 1,
    pageRange: {
      from: 1,
      to: 1,
    },
  });

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const updateSettings = (updates: Partial<PageNumberSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const addPageNumberToPage = useCallback(
    async (pdf: PDFDocument, pageIndex: number, actualPageNumber: number) => {
      const page = pdf.getPage(pageIndex);
      const { width, height } = page.getSize();

      // Load font
      // biome-ignore lint/suspicious/noExplicitAny: <No exact type available>
      const fontMap: Record<string, any> = {
        Helvetica: StandardFonts.Helvetica,
        "Helvetica-Bold": StandardFonts.HelveticaBold,
        "Times-Roman": StandardFonts.TimesRoman,
        "Times-Bold": StandardFonts.TimesRomanBold,
        Courier: StandardFonts.Courier,
        "Courier-Bold": StandardFonts.CourierBold,
      };

      const font = await pdf.embedFont(fontMap[settings.fontFamily] || StandardFonts.HelveticaBold);

      // Calculate page number to display
      const displayNumber = settings.firstNumber + (actualPageNumber - settings.pageRange.from);
      const pageNumberText = displayNumber.toString();

      const textWidth = font.widthOfTextAtSize(pageNumberText, settings.fontSize);
      const margin = marginValues[settings.margin];

      // Calculate position
      let x = width / 2 - textWidth / 2;
      let y = margin;

      switch (settings.position) {
        case "top-left":
          x = margin;
          y = height - margin;
          break;
        case "top-center":
          x = width / 2 - textWidth / 2;
          y = height - margin;
          break;
        case "top-right":
          x = width - margin - textWidth;
          y = height - margin;
          break;
        case "bottom-left":
          x = margin;
          y = margin;
          break;
        case "bottom-center":
          x = width / 2 - textWidth / 2;
          y = margin;
          break;
        case "bottom-right":
          x = width - margin - textWidth;
          y = margin;
          break;
      }

      // Draw page number
      page.drawText(pageNumberText, {
        x,
        y,
        size: settings.fontSize,
        font,
        color: rgb(0, 0, 0),
        opacity: settings.opacity,
      });
    },
    [settings],
  );

  const renderPreview = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    setIsUpdatingPreview(true);

    try {
      // Create a temporary PDF for preview
      const tempPdf = await PDFDocument.create();
      const [copiedPage] = await tempPdf.copyPages(pdfDoc, [currentPage - 1]);
      tempPdf.addPage(copiedPage);

      // Only add page number if current page is within the selected range
      if (currentPage >= settings.pageRange.from && currentPage <= settings.pageRange.to) {
        await addPageNumberToPage(tempPdf, 0, currentPage);
      }

      // Render to canvas
      const pdfBytes = await tempPdf.save();
      const arrayBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(url);
    } catch (error) {
      console.error("Error rendering preview:", error);
    } finally {
      setIsUpdatingPreview(false);
    }
  }, [pdfDoc, currentPage, settings, previewUrl, addPageNumberToPage]);

  // Debounced preview update
  useEffect(() => {
    if (!pdfDoc) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      renderPreview();
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [pdfDoc, renderPreview]);

  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(0, maxLength - 3 - (extension?.length || 0));
    return `${truncated}...${extension}`;
  };

  const handleFileSelect = useCallback(async (files: File[]) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPageCount();

      setPdfDoc(pdf);
      setTotalPages(pages);
      setCurrentPage(1);
      setFromInput("1");
      setToInput(pages.toString());
      setFirstNumberInput("1");
      setSettings((prev) => ({
        ...prev,
        pageRange: { from: 1, to: pages },
      }));

      toast.success("PDF loaded successfully!");
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownload = async () => {
    if (!pdfDoc || !file) {
      toast.error("No PDF loaded");
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDocCopy = await PDFDocument.load(await pdfDoc.save());

      // Add page numbers to pages within range
      for (let i = settings.pageRange.from - 1; i < settings.pageRange.to; i++) {
        await addPageNumberToPage(pdfDocCopy, i, i + 1);
      }

      const pdfBytes = await pdfDocCopy.save();
      const arrayBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_numbered.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded with page numbers!");
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setCurrentPage(1);
    setFromInput("1");
    setToInput("1");
    setFirstNumberInput("1");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSettings({
      fontFamily: "Helvetica-Bold",
      fontSize: 12,
      opacity: 1,
      position: "bottom-right",
      margin: "recommended",
      firstNumber: 1,
      pageRange: { from: 1, to: 1 },
    });
  };

  const goToPreviousPage = () => {
    if (currentPage > settings.pageRange.from) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < settings.pageRange.to) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (!file || !pdfDoc) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <FileUpload
          onFilesSelected={handleFileSelect}
          acceptedFileTypes={["application/pdf"]}
          maxFiles={1}
          maxFileSize={150}
          label="Add Page Numbers to PDF"
          description="Upload a PDF file to add page numbers"
        />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mt-5 max-w-7xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Preview Area */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{truncateFileName(file.name)}</span>
                <span className="text-xs text-gray-500">({totalPages} pages)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={goToPreviousPage} disabled={currentPage <= settings.pageRange.from}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button size="sm" variant="outline" onClick={goToNextPage} disabled={currentPage >= settings.pageRange.to}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="relative overflow-hidden bg-gray-100 rounded">
              {isUpdatingPreview && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
                </div>
              )}
              {previewUrl && (
                <iframe
                  key={previewUrl}
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                  className="w-full border-0 h-125"
                  title="PDF Preview"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-6 space-y-6 bg-white border rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">Page Number Settings</h3>

            {/* Position */}
            <div className="space-y-2">
              <Label>Position</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"] as Position[]).map(
                  (pos) => (
                    <button
                      type="button"
                      key={pos}
                      onClick={() => updateSettings({ position: pos })}
                      className={`h-10 rounded border-2 ${
                        settings.position === pos ? "bg-primary border-primary" : "bg-white border-gray-300 hover:border-gray-400"
                      }`}
                      title={pos.replace("-", " ")}
                    />
                  ),
                )}
              </div>
            </div>

            {/* First Number */}
            <div className="space-y-2">
              <Label>First Number</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={firstNumberInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers
                  if (value === "" || /^\d+$/.test(value)) {
                    setFirstNumberInput(value);
                    const numValue = parseInt(value, 10);
                    if (!Number.isNaN(numValue) && numValue >= 1) {
                      updateSettings({ firstNumber: numValue });
                    }
                  }
                }}
                onBlur={() => {
                  const numValue = parseInt(firstNumberInput, 10);
                  if (Number.isNaN(numValue) || numValue < 1) {
                    setFirstNumberInput("1");
                    updateSettings({ firstNumber: 1 });
                  } else {
                    setFirstNumberInput(numValue.toString());
                    updateSettings({ firstNumber: numValue });
                  }
                }}
              />
            </div>

            {/* Font Family and Margin */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select value={settings.fontFamily} onValueChange={(value) => updateSettings({ fontFamily: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Helvetica-Bold">Helvetica Bold</SelectItem>
                    <SelectItem value="Times-Roman">Times Roman</SelectItem>
                    <SelectItem value="Times-Bold">Times Bold</SelectItem>
                    <SelectItem value="Courier">Courier</SelectItem>
                    <SelectItem value="Courier-Bold">Courier Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Margin</Label>
                <Select value={settings.margin} onValueChange={(value: Margin) => updateSettings({ margin: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                min={8}
                max={72}
                step={1}
                value={[settings.fontSize]}
                onValueChange={(value) => updateSettings({ fontSize: value[0] })}
              />
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <Label>Opacity: {Math.round(settings.opacity * 100)}%</Label>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[settings.opacity]}
                onValueChange={(value) => updateSettings({ opacity: value[0] })}
              />
            </div>

            {/* Page Range */}
            <div className="space-y-2">
              <Label>Pages</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">From</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={fromInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers
                      if (value === "" || /^\d+$/.test(value)) {
                        setFromInput(value);
                        const numValue = parseInt(value, 10);
                        if (!Number.isNaN(numValue) && numValue >= 1 && numValue <= totalPages) {
                          updateSettings({ pageRange: { ...settings.pageRange, from: numValue } });
                        }
                      }
                    }}
                    onBlur={() => {
                      const numValue = parseInt(fromInput, 10);
                      if (Number.isNaN(numValue) || numValue < 1) {
                        setFromInput("1");
                        updateSettings({ pageRange: { ...settings.pageRange, from: 1 } });
                        if (currentPage < 1) setCurrentPage(1);
                      } else if (numValue > settings.pageRange.to) {
                        setFromInput(settings.pageRange.to.toString());
                        updateSettings({ pageRange: { ...settings.pageRange, from: settings.pageRange.to } });
                        if (currentPage < settings.pageRange.to) setCurrentPage(settings.pageRange.to);
                      } else {
                        setFromInput(numValue.toString());
                        updateSettings({ pageRange: { ...settings.pageRange, from: numValue } });
                        if (currentPage < numValue) setCurrentPage(numValue);
                      }
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">To</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={toInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers
                      if (value === "" || /^\d+$/.test(value)) {
                        setToInput(value);
                        const numValue = parseInt(value, 10);
                        if (!Number.isNaN(numValue) && numValue >= 1 && numValue <= totalPages) {
                          updateSettings({ pageRange: { ...settings.pageRange, to: numValue } });
                        }
                      }
                    }}
                    onBlur={() => {
                      const numValue = parseInt(toInput, 10);
                      if (Number.isNaN(numValue) || numValue > totalPages) {
                        setToInput(totalPages.toString());
                        updateSettings({ pageRange: { ...settings.pageRange, to: totalPages } });
                        if (currentPage > totalPages) setCurrentPage(totalPages);
                      } else if (numValue < settings.pageRange.from) {
                        setToInput(settings.pageRange.from.toString());
                        updateSettings({ pageRange: { ...settings.pageRange, to: settings.pageRange.from } });
                        if (currentPage > settings.pageRange.from) setCurrentPage(settings.pageRange.from);
                      } else {
                        setToInput(numValue.toString());
                        updateSettings({ pageRange: { ...settings.pageRange, to: numValue } });
                        if (currentPage > numValue) setCurrentPage(numValue);
                      }
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Page numbers will apply to pages {settings.pageRange.from}-{settings.pageRange.to}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-2 border-t">
              <Button onClick={handleDownload} disabled={isProcessing} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={resetAll} variant="outline" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
