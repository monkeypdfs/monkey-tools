"use client";

import jsPDF from "jspdf";
import { toast } from "sonner";
import NextImage from "next/image";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { useState, useCallback, useRef, useEffect } from "react";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { Download, Loader2, ImageIcon, AlertTriangle, Trash2 } from "lucide-react";

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

interface ConversionResult {
  blob: Blob;
  fileName: string;
  imageCount: number;
}

export default function JPGToPDF() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  // Handle file selection
  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    // Convert to our format with previews
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      preview: URL.createObjectURL(file),
    }));

    setFiles(uploadedFiles);
    setConversionResult(null); // Reset any previous results
  }, []);

  // Add more files
  const addMoreFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle additional file selection
  const handleAdditionalFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    // Validate and add to existing files
    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/jpeg") && !file.type.startsWith("image/jpg")) {
        toast.error(`${file.name} is not a JPG image`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const uploadedFiles: UploadedFile[] = validFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        preview: URL.createObjectURL(file),
      }));

      setFiles((prev) => [...prev, ...uploadedFiles]);
      setConversionResult(null); // Reset result when adding files
      toast.success(`Added ${validFiles.length} more image(s)`);
    }

    // Reset input
    e.target.value = "";
  }, []);

  // Convert JPG to PDF
  const convertToPdf = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setConversionProgress(0);

    try {
      const pdf = new jsPDF();
      let processedCount = 0;

      for (const uploadedFile of files) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(uploadedFile.file);
        });

        // Create image element to get dimensions
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUrl;
        });

        // Draw image to canvas to handle EXIF orientation
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const orientedDataUrl = canvas.toDataURL("image/jpeg");

        const imgWidth = img.width;
        const imgHeight = img.height;

        // Calculate dimensions to fit A4 page
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;

        // Center the image
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        if (processedCount > 0) {
          pdf.addPage();
        }

        pdf.addImage(orientedDataUrl, "JPEG", x, y, finalWidth, finalHeight);

        processedCount++;
        setConversionProgress((processedCount / files.length) * 100);
      }

      const pdfBlob = pdf.output("blob");

      setConversionResult({
        blob: pdfBlob,
        fileName: `converted-${Date.now()}.pdf`,
        imageCount: files.length,
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

  // Remove a specific file
  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
    setConversionResult(null); // Reset result when removing files
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    // Clean up all previews
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setConversionResult(null);
    setConversionProgress(0);
  }, [files]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="w-full">
      {/* Upload Section */}
      <section aria-labelledby="upload-section" className="max-w-3xl mx-auto">
        {files.length === 0 ? (
          <FileUpload
            mode="accumulate"
            maxFiles={20}
            onFilesSelected={handleFilesSelected}
            acceptedFileTypes={["image/jpeg", "image/jpg"]}
            label="Upload JPG Images"
            description="Select multiple JPG images to convert to PDF"
            disclaimer="Images are processed securely and not stored on our servers"
          />
        ) : (
          <div className="space-y-6">
            {/* Files Info */}
            <div className="p-4 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {files.length} image{files.length !== 1 ? "s" : ""} selected
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Total size: {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addMoreFiles}>
                  Add More
                </Button>
              </div>
            </div>

            {/* Hidden file input for adding more files */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg"
              onChange={handleAdditionalFiles}
              className="hidden"
            />

            {/* Image Previews */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Selected Images</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {files.map((file, index) => (
                  <div key={file.id} className="relative group">
                    <div className="relative overflow-hidden border-2 rounded-lg aspect-square border-border bg-muted">
                      {file.preview && (
                        <NextImage src={file.preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute w-6 h-6 p-0 transition-opacity shadow-md opacity-0 -top-2 -right-2 group-hover:opacity-100 hover:scale-110"
                      onClick={() => removeFile(file.id)}
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div className="absolute px-2 py-1 text-xs text-white rounded bottom-1 left-1 bg-black/70">{index + 1}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Images will be converted to PDF pages in the order shown above</p>
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
                    <ImageIcon className="w-4 h-4 mr-2" />
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
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-800 dark:text-green-200">Conversion Complete!</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">Your PDF is ready for download</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                    <div className="p-3 text-center rounded-lg bg-white/50 dark:bg-black/20">
                      <p className="text-2xl font-bold text-green-600">{conversionResult.imageCount}</p>
                      <p className="text-sm text-muted-foreground">Images Converted</p>
                    </div>
                    <div className="p-3 text-center rounded-lg bg-white/50 dark:bg-black/20">
                      <p className="text-2xl font-bold text-green-600">{conversionResult.imageCount}</p>
                      <p className="text-sm text-muted-foreground">PDF Pages</p>
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
            <span className="text-sm font-medium">Converting images to PDF...</span>
            <span className="text-sm text-muted-foreground">{Math.round(conversionProgress)}%</span>
          </div>
          <Progress value={conversionProgress} className="w-full h-2" />
        </div>
      )}

      {/* Warning */}
      <Alert className="max-w-3xl mx-auto mt-6 text-yellow-800 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        <AlertTitle>Conversion Notice</AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          Images are converted in the order they were uploaded. Make sure to upload them in the desired sequence.
        </AlertDescription>
      </Alert>
    </div>
  );
}
