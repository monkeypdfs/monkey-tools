"use client";

import JSZip from "jszip";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { MAX_FILE_SIZE } from "@/modules/common/constants";
import { Download, Loader2, ImageIcon, FileText } from "lucide-react";
import { HowToStep } from "@/modules/common/ui/components/how-to-step";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";

interface UploadedFile {
  file: File;
  id: string;
}

interface ConvertedImage {
  blob: Blob;
  fileName: string;
  pageNumber: number;
}

export default function PdfToJpg() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Handle file selection
  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const selectedFile = newFiles[0];

    if (!selectedFile) return;

    // Check file size
    if (!selectedFile.size || selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`File "${selectedFile.name}" is too large. Maximum file size is 50MB.`);
      return;
    }

    // Check if it's a PDF
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }

    const uploadedFile: UploadedFile = {
      file: selectedFile,
      id: `${selectedFile.name}-${Date.now()}-${Math.random()}`,
    };

    setFile(uploadedFile);
    setConvertedImages([]); // Reset any previous conversions
    setTotalPages(0);
    setCurrentPage(0);
  }, []);

  // Convert PDF to JPG
  const convertToJpg = useCallback(async () => {
    if (!file) {
      toast.error("Please select a PDF file first.");
      return;
    }

    setIsConverting(true);
    setConvertProgress(0);
    setConvertedImages([]);

    try {
      setConvertProgress(10);

      // Convert file to ArrayBuffer
      const fileBuffer = await file.file.arrayBuffer();

      setConvertProgress(20);

      // Dynamically import pdfjs-dist legacy build
      const pdfjsLib = await import("pdfjs-dist");

      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);

      setConvertProgress(30);

      const images: ConvertedImage[] = [];
      const progressPerPage = 60 / numPages; // 60% of progress for conversion

      // Convert each page to JPG
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setCurrentPage(pageNum);
        const page = await pdf.getPage(pageNum);

        // Set up canvas for rendering
        const scale = 2.0; // Higher scale for better quality
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get canvas context");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        setConvertProgress(30 + (pageNum - 1) * progressPerPage);

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas, // Add the canvas element
        };

        await page.render(renderContext).promise;

        // Convert canvas to JPG blob (wrap in Promise to make it awaitable)
        const jpgBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to convert canvas to blob"));
              }
            },
            "image/jpeg",
            0.95, // Quality setting
          );
        });

        const baseName = file.file.name.replace(/\.pdf$/i, "");
        const fileName = `${baseName}_page_${pageNum}.jpg`;

        images.push({
          blob: jpgBlob,
          fileName,
          pageNumber: pageNum,
        });

        setConvertProgress(30 + pageNum * progressPerPage);
      }

      // All pages converted
      setConvertedImages(images);
      setConvertProgress(100);
      toast.success(`Successfully converted ${numPages} page${numPages > 1 ? "s" : ""} to JPG!`);
    } catch (error) {
      console.error("Error converting PDF to JPG:", error);
      toast.error("An error occurred while converting the PDF to JPG.");
    } finally {
      setIsConverting(false);
    }
  }, [file]);

  // Download single image
  const downloadImage = useCallback((image: ConvertedImage) => {
    const url = URL.createObjectURL(image.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = image.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Download all images as ZIP file
  const downloadAllImages = useCallback(async () => {
    if (convertedImages.length === 0) {
      toast.error("No images to download.");
      return;
    }

    try {
      const zip = new JSZip();
      const baseName = file?.file.name.replace(/\.pdf$/i, "") || "pdf_images";

      // Add each image to the ZIP file
      convertedImages.forEach((image) => {
        zip.file(image.fileName, image.blob);
      });

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link for the ZIP file
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${convertedImages.length} images as ZIP file!`);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      toast.error("Failed to create ZIP file.");
    }
  }, [convertedImages, file]);

  // Reset everything
  const reset = useCallback(() => {
    setFile(null);
    setConvertedImages([]);
    setTotalPages(0);
    setCurrentPage(0);
    setConvertProgress(0);
  }, []);

  return (
    <div className="relative w-full py-10 overflow-hidden md:py-14 bg-background text-foreground">
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        <h1 className="text-5xl font-bold text-center">PDF to JPG</h1>
        <p className="my-6 text-base text-center">Convert PDF pages to high-quality JPG images.</p>

        {/* Upload Section */}
        <section aria-labelledby="upload-section" className="max-w-3xl mx-auto">
          {!file ? (
            <FileUpload
              mode="append"
              maxFiles={1}
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={["application/pdf"]}
              label="Upload PDF to Convert"
              description="Select a PDF file to convert its pages to JPG images"
            />
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="p-4 border rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">{file.file.name}</h3>
                    <p className="text-sm text-muted-foreground">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>

              {/* Convert Button */}
              <div className="flex flex-row gap-4">
                <Button
                  onClick={convertToJpg}
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
                      Convert to JPG
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={reset} size="lg" className="flex-1">
                  Reset
                </Button>
              </div>

              {/* Converted Images */}
              {convertedImages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold md:text-lg">
                      Converted Images ({convertedImages.length} page{convertedImages.length > 1 ? "s" : ""})
                    </h4>
                    <Button onClick={downloadAllImages} size="lg" className="text-white bg-green-600 hover:bg-green-700">
                      <Download className="mr-2 size-4" />
                      Download ZIP
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {convertedImages.map((image) => (
                      <div key={image.pageNumber} className="p-4 border rounded-lg bg-card/50">
                        <div
                          className="mb-3 overflow-hidden rounded-md aspect-video bg-muted"
                          role="img"
                          aria-label={`Page ${image.pageNumber}`}
                          style={{
                            backgroundImage: `url(${URL.createObjectURL(image.blob)})`,
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "contain",
                          }}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Page {image.pageNumber}</span>
                          <Button onClick={() => downloadImage(image)} size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            JPG
                          </Button>
                        </div>
                      </div>
                    ))}
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
              <span className="text-sm font-medium">
                Converting PDF to JPG... {currentPage > 0 && totalPages > 0 ? `(${currentPage}/${totalPages})` : ""}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(convertProgress)}%</span>
            </div>
            <Progress value={convertProgress} className="w-full h-2" />
          </div>
        )}
      </div>

      <HowToStep
        title="How To Convert PDF to JPG"
        subtitle="follow along with the steps below"
        steps={[
          { title: "Step 1", description: "Upload your PDF file" },
          { title: "Step 2", description: "Click 'Convert to JPG' to start the conversion" },
          { title: "Step 3", description: "Download individual pages or all pages as a ZIP file" },
        ]}
      />
    </div>
  );
}
