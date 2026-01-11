"use client";

import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Slider } from "@workspace/ui/components/slider";
import { useState, useCallback, useRef, useEffect } from "react";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { Download, Loader2, FileText, Trash2, Settings, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";

interface WatermarkSettings {
  text: string;
  fontSize: number;
  fontFamily: string;
  opacity: number;
  rotation: number;
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  layer: "over" | "under";
  color: string;
}

interface PageRange {
  from: number;
  to: number;
}

export default function AddWatermarkPDF() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [settings, setSettings] = useState<WatermarkSettings>({
    text: "CONFIDENTIAL",
    fontSize: 48,
    fontFamily: "Helvetica-Bold",
    opacity: 0.3,
    rotation: 0,
    position: "center",
    layer: "over",
    color: "#000000",
  });

  const [pageRange, setPageRange] = useState<PageRange>({
    from: 1,
    to: 1,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const truncateFileName = (fileName: string, maxLength: number = 40) => {
    if (fileName.length <= maxLength) return fileName;

    const extension = fileName.slice(fileName.lastIndexOf("."));
    const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf("."));

    const startLength = Math.floor((maxLength - extension.length - 3) / 2);
    const endLength = Math.floor((maxLength - extension.length - 3) / 2);

    return `${nameWithoutExt.slice(0, startLength)}...${nameWithoutExt.slice(-endLength)}${extension}`;
  };

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }

    setIsProcessing(true);
    setSelectedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPdfDoc(pdf);
      setTotalPages(pdf.getPageCount());
      setCurrentPage(1);
      setPageRange({ from: 1, to: pdf.getPageCount() });
      toast.success("PDF loaded successfully!");
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const addWatermarkToPage = useCallback(
    async (pdf: PDFDocument, pageIndex: number) => {
      const page = pdf.getPage(pageIndex);
      const { width, height } = page.getSize();

      // Load font
      const fontMap: Record<string, string> = {
        Helvetica: StandardFonts.Helvetica,
        "Helvetica-Bold": StandardFonts.HelveticaBold,
        "Times-Roman": StandardFonts.TimesRoman,
        "Times-Bold": StandardFonts.TimesRomanBold,
        Courier: StandardFonts.Courier,
        "Courier-Bold": StandardFonts.CourierBold,
      };

      const font = await pdf.embedFont(fontMap[settings.fontFamily] || StandardFonts.HelveticaBold);
      const textWidth = font.widthOfTextAtSize(settings.text, settings.fontSize);

      // Get approximate text height (for visual positioning)
      const textHeight = settings.fontSize;

      // Define where the CENTER of the text should be for each position
      let centerX = width / 2;
      let centerY = height / 2;

      const margin = 100; // Distance from edges

      switch (settings.position) {
        case "top-left":
          centerX = margin;
          centerY = height - margin;
          break;
        case "top-center":
          centerX = width / 2;
          centerY = height - margin;
          break;
        case "top-right":
          centerX = width - margin;
          centerY = height - margin;
          break;
        case "center":
          centerX = width / 2;
          centerY = height / 2;
          break;
        case "bottom-left":
          centerX = margin;
          centerY = margin;
          break;
        case "bottom-center":
          centerX = width / 2;
          centerY = margin;
          break;
        case "bottom-right":
          centerX = width - margin;
          centerY = margin;
          break;
      }

      // Parse color
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return { r: 0, g: 0, b: 0 };

        const r = result[1] ? parseInt(result[1], 16) / 255 : 0;
        const g = result[2] ? parseInt(result[2], 16) / 255 : 0;
        const b = result[3] ? parseInt(result[3], 16) / 255 : 0;

        return { r, g, b };
      };

      const color = hexToRgb(settings.color);

      // Calculate position with rotation
      const radians = (settings.rotation * Math.PI) / 180;

      // Start with text centered at anchor point (no rotation)
      let x = centerX - textWidth / 2;
      let y = centerY - textHeight / 3; // Slightly above center for better visual alignment

      // Adjust for rotation: rotate the position around the anchor point
      if (settings.rotation !== 0) {
        const dx = x - centerX;
        const dy = y - centerY;

        // Rotate the vector
        const rotatedDx = dx * Math.cos(radians) - dy * Math.sin(radians);
        const rotatedDy = dx * Math.sin(radians) + dy * Math.cos(radians);

        x = centerX + rotatedDx;
        y = centerY + rotatedDy;
      }

      // Draw watermark
      const drawOptions = {
        x,
        y,
        size: settings.fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
        opacity: settings.opacity,
        rotate: degrees(settings.rotation),
      };

      if (settings.layer === "under") {
        page.drawText(settings.text, drawOptions);
      } else {
        page.drawText(settings.text, drawOptions);
      }
    },
    [settings],
  );

  const renderPreview = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    setIsUpdatingPreview(true);

    try {
      // Removed unused width/height

      // Create a temporary PDF for preview
      const tempPdf = await PDFDocument.create();
      const [copiedPage] = await tempPdf.copyPages(pdfDoc, [currentPage - 1]);
      tempPdf.addPage(copiedPage);

      // Only add watermark if current page is within the selected range
      if (currentPage >= pageRange.from && currentPage <= pageRange.to) {
        await addWatermarkToPage(tempPdf, 0);
      }

      // Render to canvas
      const pdfBytes = await tempPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (error) {
      console.error("Error rendering preview:", error);
    } finally {
      setIsUpdatingPreview(false);
    }
  }, [pdfDoc, currentPage, pageRange, addWatermarkToPage]);

  const applyWatermark = async () => {
    if (!pdfDoc || !selectedFile) return;

    setIsProcessing(true);

    try {
      // Create a new PDF with watermarks
      const watermarkedPdf = await PDFDocument.create();
      const pageCount = pdfDoc.getPageCount();

      // Determine which pages to watermark
      const startPage = Math.max(1, pageRange.from);
      const endPage = Math.min(pageCount, pageRange.to);

      for (let i = 0; i < pageCount; i++) {
        const [copiedPage] = await watermarkedPdf.copyPages(pdfDoc, [i]);
        watermarkedPdf.addPage(copiedPage);
      }

      // Add watermark to selected pages
      for (let i = startPage - 1; i < endPage; i++) {
        await addWatermarkToPage(watermarkedPdf, i);
      }

      // Save and download
      const pdfBytes = await watermarkedPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedFile.name.replace(".pdf", "")}_watermarked.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Watermark applied to pages ${startPage}-${endPage}!`);
    } catch (error) {
      console.error("Error applying watermark:", error);
      toast.error("Failed to apply watermark. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPdfDoc(null);
    setPreviewUrl(null);
    setCurrentPage(1);
    setTotalPages(0);
    setPageRange({ from: 1, to: 1 });
    setSettings({
      text: "CONFIDENTIAL",
      fontSize: 48,
      fontFamily: "Helvetica-Bold",
      opacity: 0.3,
      rotation: 0,
      position: "center",
      layer: "over",
      color: "#000000",
    });
  }, [previewUrl]);

  // Update preview when settings change (debounced)
  useEffect(() => {
    if (pdfDoc) {
      const timer = setTimeout(() => {
        renderPreview();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pdfDoc, renderPreview]);

  const fontOptions = [
    { value: "Helvetica", label: "Helvetica" },
    { value: "Helvetica-Bold", label: "Helvetica Bold" },
    { value: "Times-Roman", label: "Times Roman" },
    { value: "Times-Bold", label: "Times Bold" },
    { value: "Courier", label: "Courier" },
    { value: "Courier-Bold", label: "Courier Bold" },
  ];

  const positionOptions = [
    { value: "center", label: "Center" },
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  const rotationOptions = [
    { value: 0, label: "Do not rotate" },
    { value: 45, label: "45 degrees" },
    { value: 90, label: "90 degrees" },
    { value: 180, label: "180 degrees" },
    { value: 270, label: "270 degrees" },
  ];

  return (
    <div className="w-full">
      {/* Upload interface */}
      {!selectedFile && (
        <section className="max-w-4xl mx-auto mb-8">
          <div className="space-y-4">
            <FileUpload
              onFilesSelected={handleFileSelect}
              acceptedFileTypes={["application/pdf"]}
              maxFiles={1}
              maxFileSize={50}
            />
          </div>
        </section>
      )}

      {/* Main watermark interface */}
      {selectedFile && pdfDoc && (
        <div className="mx-auto my-10 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Preview Area */}
            <div className="space-y-6 lg:col-span-2">
              {/* File Info with Page Navigation */}
              <div className="flex flex-col justify-between gap-3 p-3 rounded-lg sm:flex-row sm:items-center bg-muted">
                <div className="flex items-center flex-1 min-w-0 gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate" title={selectedFile.name}>
                    {truncateFileName(selectedFile.name)}
                  </span>
                  <span className="text-sm text-muted-foreground shrink-0">({formatFileSize(selectedFile.size)})</span>
                </div>

                {/* Page Navigation */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(pageRange.from, p - 1))}
                      disabled={currentPage === pageRange.from}
                    >
                      Previous
                    </Button>
                    <span className="px-2 text-sm whitespace-nowrap">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(pageRange.to, p + 1))}
                      disabled={currentPage === pageRange.to}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg bg-muted">
                <div className="relative flex items-center justify-center w-full overflow-hidden bg-white rounded shadow-lg h-150">
                  {previewUrl ? (
                    <>
                      <iframe
                        src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-0"
                        title="PDF Preview"
                        key={previewUrl}
                      />
                      {isUpdatingPreview && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span>Loading preview...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={applyWatermark} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Watermarked PDF
                    </>
                  )}
                </Button>
                <Button size="lg" variant="outline" onClick={resetAll}>
                  <Trash2 className="w-4 h-4" />
                  Upload New PDF
                </Button>
              </div>
            </div>

            {/* Settings Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky space-y-6 top-8">
                {/* Watermark Settings */}
                <div className="p-6 space-y-6 border rounded-lg bg-card">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Watermark Settings</h3>
                  </div>

                  {/* Text */}
                  <div className="space-y-2">
                    <Label>Watermark Text</Label>
                    <Input
                      value={settings.text}
                      onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                      placeholder="Enter watermark text"
                    />
                  </div>

                  {/* Font Family */}
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(value) => setSettings({ ...settings, fontFamily: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-2">
                    <Label>Font Size: {settings.fontSize}px</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => value !== undefined && setSettings({ ...settings, fontSize: value })}
                      min={12}
                      max={120}
                      step={1}
                    />
                  </div>

                  {/* Opacity */}
                  <div className="space-y-2">
                    <Label>Opacity: {Math.round(settings.opacity * 100)}%</Label>
                    <Slider
                      value={[settings.opacity * 100]}
                      onValueChange={([value]) => value !== undefined && setSettings({ ...settings, opacity: value / 100 })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  {/* Rotation */}
                  <div className="space-y-2">
                    <Label>Rotation</Label>
                    <Select
                      value={settings.rotation.toString()}
                      onValueChange={(value) => setSettings({ ...settings, rotation: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rotationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pages */}
                  <div className="space-y-2">
                    <Label>Pages</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">From</Label>
                        <Input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={pageRange.from}
                          onChange={(e) => {
                            const value = Math.max(1, Math.min(totalPages, Number(e.target.value) || 1));
                            const newPageRange = { ...pageRange, from: value };
                            // Ensure 'to' is at least equal to 'from'
                            if (value > pageRange.to) {
                              newPageRange.to = value;
                            }
                            setPageRange(newPageRange);
                            // Update current page to show preview in range
                            if (currentPage < value) {
                              setCurrentPage(value);
                            } else if (currentPage > pageRange.to) {
                              setCurrentPage(value);
                            }
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              setPageRange({ ...pageRange, from: 1 });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">To</Label>
                        <Input
                          type="number"
                          min={pageRange.from}
                          max={totalPages}
                          value={pageRange.to}
                          onChange={(e) => {
                            const value = Math.max(pageRange.from, Math.min(totalPages, Number(e.target.value) || totalPages));
                            setPageRange({ ...pageRange, to: value });
                            // Update current page to show preview in range
                            if (currentPage > value) {
                              setCurrentPage(value);
                            } else if (currentPage < pageRange.from) {
                              setCurrentPage(pageRange.from);
                            }
                          }}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              setPageRange({ ...pageRange, to: totalPages });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Watermark will apply to pages {pageRange.from}-{pageRange.to}
                    </p>
                  </div>

                  {/* Position */}
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select
                      value={settings.position}
                      onValueChange={(value) => setSettings({ ...settings, position: value as WatermarkSettings["position"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Layer */}
                  <div className="space-y-2">
                    <Label>Layer</Label>
                    <Select
                      value={settings.layer}
                      onValueChange={(value) => setSettings({ ...settings, layer: value as WatermarkSettings["layer"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="over">Over Text</SelectItem>
                        <SelectItem value="under">Under Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color */}
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.color}
                        onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={settings.color}
                        onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertTitle>Watermark Tips</AlertTitle>
                  <AlertDescription className="text-sm">
                    <ul className="mt-2 space-y-1">
                      <li>• Adjust opacity for subtle watermarks</li>
                      <li>• Use rotation for diagonal effects</li>
                      <li>• Preview updates automatically</li>
                      <li>• Watermark applies to all pages</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
