"use client";

import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { useState, useCallback, useEffect } from "react";
import { HowToStep } from "@/modules/common/ui/components/how-to-step";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { removeBackground, type Config } from "@imgly/background-removal";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";
import { Download, Loader2, ImageIcon, AlertTriangle, Trash2, Wand2, CheckCircle } from "lucide-react";

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

interface ProcessedImage {
  originalFile: File;
  processedBlob: Blob;
  processedUrl: string;
  id: string;
}

export default function RemoveImageBackground() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

  // Clean up previews on unmount or when files change
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  // Clean up processed URLs on unmount or when processed images change
  useEffect(() => {
    return () => {
      processedImages.forEach((img) => {
        URL.revokeObjectURL(img.processedUrl);
      });
    };
  }, [processedImages]);

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
    setProcessedImages([]); // Reset any previous results
  }, []);

  // Remove background from images
  const removeBackgrounds = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessedImages([]);

    try {
      const results: ProcessedImage[] = [];
      let processedCount = 0;

      for (const uploadedFile of files) {
        try {
          // Remove background using @imgly/background-removal
          const config: Config = {
            publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/",
            proxyToWorker: true,
          };
          const processedBlob = await removeBackground(uploadedFile.file, config);

          // Create object URL for the processed image
          const processedUrl = URL.createObjectURL(processedBlob);

          results.push({
            originalFile: uploadedFile.file,
            processedBlob,
            processedUrl,
            id: uploadedFile.id,
          });
        } catch (error) {
          console.error(`Failed to process ${uploadedFile.file.name}:`, error);
          toast.error(`Failed to remove background from ${uploadedFile.file.name}`);
        }

        processedCount++;
        // Update progress
        setProcessingProgress((processedCount / files.length) * 100);
      }

      if (results.length > 0) {
        setProcessedImages(results);
        toast.success("Image processed successfully!");
      } else {
        toast.error("Failed to process the image");
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast.error(error instanceof Error ? error.message : "Background removal failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Download single processed image
  const downloadImage = useCallback((processedImage: ProcessedImage) => {
    const link = document.createElement("a");
    link.href = processedImage.processedUrl;
    link.download = `no-bg-${processedImage.originalFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  }, []);

  // Remove a specific file
  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
    setProcessedImages((prev) => {
      const processedToRemove = prev.find((p) => p.id === fileId);
      if (processedToRemove) {
        URL.revokeObjectURL(processedToRemove.processedUrl);
      }
      return prev.filter((p) => p.id !== fileId);
    });
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    // Clean up all previews and processed URLs
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    processedImages.forEach((img) => {
      URL.revokeObjectURL(img.processedUrl);
    });
    setFiles([]);
    setProcessedImages([]);
    setProcessingProgress(0);
  }, [files, processedImages]);

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
              maxFiles={1}
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
              label="Upload Image"
              description="Select an image to remove its background"
              disclaimer="Images are processed securely and not stored on our servers"
            />
          ) : (
            <div className="space-y-6">
              {/* Files Info */}
              <div className="p-4 border rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold">1 image selected</h3>
                    <p className="text-sm text-muted-foreground">Size: {formatFileSize(files[0]?.file.size || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {processedImages.length === 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Selected Image</h4>
                  <div className="flex justify-center">
                    <div className="relative max-w-xs group">
                      <div className="relative overflow-hidden border-2 rounded-lg aspect-square border-border bg-muted">
                        {files[0]?.preview && (
                          // biome-ignore lint/performance/noImgElement: <Required for image preview because nextjs Image cannot be used for object URLs>
                          <img src={files[0].preview} alt="Selected" className="absolute inset-0 object-cover" />
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute w-6 h-6 p-0 transition-opacity shadow-md opacity-0 -top-2 -right-2 group-hover:opacity-100 hover:scale-110"
                        // biome-ignore lint/style/noNonNullAssertion: files[0] is guaranteed to exist here
                        onClick={() => removeFile(files[0]!.id)}
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Process Button */}
              {processedImages.length === 0 && (
                <div className="flex flex-row gap-4">
                  <Button
                    onClick={removeBackgrounds}
                    disabled={isProcessing}
                    size="lg"
                    className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Removing Background...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Remove Background
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={reset} size="lg" className="flex-1">
                    Clear
                  </Button>
                </div>
              )}

              {/* Processing Results */}
              {processedImages.length > 0 && (
                <div className="space-y-6">
                  {/* Success Banner */}
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-green-100 rounded-full dark:bg-green-900/30">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Background Removed Successfully!</h4>
                    </div>
                    <div className="flex flex-col gap-3 mt-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-green-700 dark:text-green-300">Your image is ready for download.</p>
                      <div className="flex w-full gap-2 sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={reset}
                          className="flex-1 text-green-800 border-green-200 sm:flex-none bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 dark:border-green-800 dark:text-green-200"
                        >
                          Start Over
                        </Button>
                        <Button
                          // biome-ignore lint/style/noNonNullAssertion: processedImages[0] is guaranteed to exist here
                          onClick={() => downloadImage(processedImages[0]!)}
                          size="sm"
                          className="flex-1 text-white bg-green-600 sm:flex-none hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Image
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Image Comparison */}
                  <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
                    {/* Original Image */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Original Image</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(files[0]?.file.size || 0)}</span>
                      </div>
                      <div className="relative overflow-hidden border rounded-xl aspect-square bg-muted/50 border-border">
                        {files[0]?.preview && (
                          // biome-ignore lint/performance/noImgElement: <Required for image preview because nextjs Image cannot be used for object URLs>
                          <img src={files[0].preview} alt="Original" className="absolute inset-0 object-contain" />
                        )}
                      </div>
                    </div>

                    {/* Processed Image */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Background Removed</span>
                        <span className="text-xs text-muted-foreground">PNG</span>
                      </div>
                      {/* Checkerboard background for transparency */}
                      <div className="relative overflow-hidden bg-white border border-green-200 rounded-xl aspect-square dark:border-green-900 dark:bg-black/20">
                        {/* CSS pattern for checkerboard transparency */}
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: `linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)`,
                            backgroundSize: `20px 20px`,
                            backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`,
                          }}
                        />
                        {/* biome-ignore lint/performance/noImgElement: <Required for image preview because nextjs Image cannot be used for object URLs> */}
                        <img
                          src={processedImages[0]?.processedUrl}
                          alt="Processed"
                          className="absolute inset-0 z-10 object-contain p-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Removing background...</span>
              <span className="text-sm text-muted-foreground">{Math.round(processingProgress)}%</span>
            </div>
            <Progress value={processingProgress} className="w-full h-2" />
          </div>
        )}

        {/* Warning */}
        <Alert className="max-w-3xl mx-auto mt-6 text-yellow-800 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <AlertTitle>Processing Notice</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            Background removal works best with images that have clear foreground subjects against simple backgrounds. Processing
            may take a few seconds per image depending on image size and complexity.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
