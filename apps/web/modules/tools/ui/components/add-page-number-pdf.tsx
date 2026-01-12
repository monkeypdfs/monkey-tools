"use client";

import { toast } from "sonner";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Slider } from "@workspace/ui/components/slider";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Download, RotateCcw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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

const marginValues: Record<Margin, number> = {
  small: 30,
  recommended: 50,
  large: 80,
};

// Map accessible outside to avoid recreation
const fontMap: Record<string, string> = {
  Helvetica: StandardFonts.Helvetica,
  "Helvetica-Bold": StandardFonts.HelveticaBold,
  "Times-Roman": StandardFonts.TimesRoman,
  "Times-Bold": StandardFonts.TimesRomanBold,
  Courier: StandardFonts.Courier,
  "Courier-Bold": StandardFonts.CourierBold,
};

export default function AddPageNumberPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
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

  /**
   * Pure logic to draw page numbers.
   * Does NOT embed fonts inside - expects an embedded font object.
   */
  const drawPageNumber = useCallback(
    (page: PDFPage, font: PDFFont, actualPageNumber: number, currentSettings: PageNumberSettings) => {
      const { width, height } = page.getSize();

      // Calculate page number to display
      const displayNumber = currentSettings.firstNumber + (actualPageNumber - currentSettings.pageRange.from);
      const pageNumberText = displayNumber.toString();

      const textWidth = font.widthOfTextAtSize(pageNumberText, currentSettings.fontSize);
      const margin = marginValues[currentSettings.margin];

      // Calculate position
      let x = 0;
      let y = 0;

      switch (currentSettings.position) {
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
        size: currentSettings.fontSize,
        font,
        color: rgb(0, 0, 0),
        opacity: currentSettings.opacity,
      });
    },
    [],
  );

  const renderPreview = useCallback(async () => {
    if (!pdfDoc) return;

    setIsUpdatingPreview(true);

    try {
      // Create a temporary PDF for preview
      const tempPdf = await PDFDocument.create();

      // Copy only the current page (efficient for preview)
      const [copiedPage] = await tempPdf.copyPages(pdfDoc, [currentPage - 1]);
      tempPdf.addPage(copiedPage);

      // Only add page number if current page is within the selected range
      if (currentPage >= settings.pageRange.from && currentPage <= settings.pageRange.to) {
        // Embed font ONCE for this preview doc
        const fontName = fontMap[settings.fontFamily] ?? StandardFonts.HelveticaBold;
        const font = await tempPdf.embedFont(fontName);

        // Use the shared drawing logic
        drawPageNumber(tempPdf.getPage(0), font, currentPage, settings);
      }

      // Render to PDF bytes
      const pdfBytes = await tempPdf.save();
      const arrayBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Cleanup old URL and set new one
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      previewUrlRef.current = url;
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error rendering preview:", error);
    } finally {
      setIsUpdatingPreview(false);
    }
  }, [pdfDoc, currentPage, settings, drawPageNumber]);

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

  const truncateFileName = (name: string, maxLength = 30) => {
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
      // Load PDF
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPageCount();

      setPdfDoc(pdf);
      setTotalPages(pages);
      // Reset logic
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
      // Clone the document for output
      const pdfDocCopy = await PDFDocument.load(await pdfDoc.save());

      // IMPORTANT: Embed font ONCE for the whole document
      // This prevents file bloat and corruption issues compared to embedding inside the loop
      const fontName = fontMap[settings.fontFamily] ?? StandardFonts.HelveticaBold;
      const font = await pdfDocCopy.embedFont(fontName);

      // Add page numbers to pages within range
      // Convert to 0-indexed loop
      for (let i = settings.pageRange.from - 1; i < settings.pageRange.to; i++) {
        // Safe check for index bounds
        if (i >= 0 && i < pdfDocCopy.getPageCount()) {
          drawPageNumber(pdfDocCopy.getPage(i), font, i + 1, settings);
        }
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
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
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
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
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
    <div className="w-full mx-auto mt-5 duration-500 max-w-7xl animate-in fade-in">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Preview Area */}
        <div className="lg:col-span-2">
          <div className="p-6 border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{truncateFileName(file.name)}</span>
                <span className="text-xs text-muted-foreground">({totalPages} pages)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={goToPreviousPage} disabled={currentPage <= 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-mono text-sm text-center min-w-25">
                  Page {currentPage} of {totalPages}
                </span>
                <Button size="sm" variant="outline" onClick={goToNextPage} disabled={currentPage >= totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="relative flex items-center justify-center overflow-hidden border rounded bg-muted/30 h-150">
              {isUpdatingPreview && (
                <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">Rendering preview...</span>
                  </div>
                </div>
              )}
              {previewUrl ? (
                <iframe
                  key={previewUrl}
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                  <span>Loading preview...</span>
                </div>
              )}
              {/* Hidden canvas ref if needed for advanced rendering later */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="flex flex-col h-full p-6 space-y-6 border rounded-lg shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-semibold">Settings</h3>

            <div className="flex-1 space-y-6">
              {/* Position */}
              <div className="space-y-3">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"] as Position[]).map(
                    (pos) => (
                      <button
                        type="button"
                        key={pos}
                        onClick={() => updateSettings({ position: pos })}
                        className={`h-12 rounded-md border-2 transition-all ${
                          settings.position === pos
                            ? "bg-primary/10 border-primary shadow-sm"
                            : "bg-background border-border hover:border-muted-foreground/50"
                        }`}
                        title={pos.replace("-", " ")}
                        aria-label={`Set position to ${pos.replace("-", " ")}`}
                      >
                        <div className={`w-full h-full p-2 relative`}>
                          <div
                            className={`absolute w-2 h-2 rounded-full ${settings.position === pos ? "bg-primary" : "bg-muted-foreground/30"} 
                                    ${pos.includes("top") ? "top-1" : "bottom-1"}
                                    ${pos.includes("left") ? "left-1" : pos.includes("right") ? "right-1" : "left-1/2 -ml-1"}
                                `}
                          />
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Font Settings Group */}
              <div className="space-y-4">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">Typography</Label>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Family</Label>
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
                    <Label className="text-xs">Margin</Label>
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

                {/* Font Size & Opacity - Compact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs">Size</Label>
                      <span className="text-xs text-muted-foreground">{settings.fontSize}px</span>
                    </div>
                    <Slider
                      min={8}
                      max={72}
                      step={1}
                      value={[settings.fontSize]}
                      onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                      className="py-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs">Opacity</Label>
                      <span className="text-xs text-muted-foreground">{Math.round(settings.opacity * 100)}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[settings.opacity]}
                      onValueChange={(value) => updateSettings({ opacity: value[0] })}
                      className="py-1"
                    />
                  </div>
                </div>
              </div>

              {/* Numbering Logic */}
              <div className="pt-2 space-y-4 border-t">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">Numbering</Label>

                <div className="space-y-2">
                  <Label className="text-xs">Start sequence from</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={firstNumberInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        setFirstNumberInput(value);
                        const num = parseInt(value, 10);
                        if (!Number.isNaN(num) && num >= 1) updateSettings({ firstNumber: num });
                      }
                    }}
                    onBlur={() => {
                      const num = parseInt(firstNumberInput, 10);
                      if (Number.isNaN(num) || num < 1) {
                        setFirstNumberInput("1");
                        updateSettings({ firstNumber: 1 });
                      }
                    }}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    If set to 5, the first page will be numbered "5", next "6", etc.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Apply From Page</Label>
                    <Input
                      value={fromInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d+$/.test(val)) {
                          setFromInput(val);
                          const n = parseInt(val, 10);
                          if (!Number.isNaN(n) && n >= 1 && n <= totalPages)
                            updateSettings({ pageRange: { ...settings.pageRange, from: n } });
                        }
                      }}
                      onBlur={() => {
                        let n = parseInt(fromInput, 10);
                        if (Number.isNaN(n) || n < 1) n = 1;
                        if (n > settings.pageRange.to) n = settings.pageRange.to;
                        setFromInput(n.toString());
                        updateSettings({ pageRange: { ...settings.pageRange, from: n } });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">To Page</Label>
                    <Input
                      value={toInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d+$/.test(val)) {
                          setToInput(val);
                          const n = parseInt(val, 10);
                          if (!Number.isNaN(n) && n >= 1 && n <= totalPages)
                            updateSettings({ pageRange: { ...settings.pageRange, to: n } });
                        }
                      }}
                      onBlur={() => {
                        let n = parseInt(toInput, 10);
                        if (Number.isNaN(n) || n > totalPages) n = totalPages;
                        if (n < settings.pageRange.from) n = settings.pageRange.from;
                        setToInput(n.toString());
                        updateSettings({ pageRange: { ...settings.pageRange, to: n } });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-3 border-t">
              <Button size={"sm"} onClick={handleDownload} disabled={isProcessing} className="w-full text-sm shadow-md h-11">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Numbered PDF
                  </>
                )}
              </Button>
              <Button onClick={resetAll} variant="ghost" className="w-full text-muted-foreground">
                <RotateCcw className="w-4 h-4" />
                Reset & Upload New File
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
