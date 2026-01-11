"use client";

import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { useState, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { Download, Loader2, ImageIcon, AlertTriangle, Trash2, Zap, CheckCircle } from "lucide-react";

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

interface CompressedImage {
  originalFile: File;
  compressedBlob: Blob;
  compressedUrl: string;
  id: string;
  compressionRatio: number;
}

export default function CompressImage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);

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

  // Clean up compressed URLs on unmount or when compressed images change
  useEffect(() => {
    return () => {
      compressedImages.forEach((img) => {
        URL.revokeObjectURL(img.compressedUrl);
      });
    };
  }, [compressedImages]);

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
    setCompressedImages([]); // Reset any previous results
  }, []);

  // Compress images
  const compressImages = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setCompressedImages([]);

    try {
      const results: CompressedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const uploadedFile = files[i];

        if (!uploadedFile) continue;

        try {
          // Compress image using browser-image-compression
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            onProgress: (progress: number) => {
              setProcessingProgress(progress);
            },
          };
          const compressedBlob = await imageCompression(uploadedFile.file, options);

          // Create object URL for the compressed image
          const compressedUrl = URL.createObjectURL(compressedBlob);

          const compressionRatio = ((uploadedFile.file.size - compressedBlob.size) / uploadedFile.file.size) * 100;

          results.push({
            originalFile: uploadedFile.file,
            compressedBlob,
            compressedUrl,
            id: uploadedFile.id,
            compressionRatio,
          });
        } catch (error) {
          console.error(`Failed to compress ${uploadedFile.file.name}:`, error);
          toast.error(`Failed to compress ${uploadedFile.file.name}`);
        }
      }

      if (results.length > 0) {
        setCompressedImages(results);
        toast.success("Image compressed successfully!");
      } else {
        toast.error("Failed to compress the image");
      }
    } catch (error) {
      console.error("Compression error:", error);
      toast.error(error instanceof Error ? error.message : "Image compression failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Download compressed image
  const downloadImage = useCallback((compressedImage: CompressedImage) => {
    const link = document.createElement("a");
    link.href = compressedImage.compressedUrl;
    link.download = `compressed-${compressedImage.originalFile.name}`;
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
    setCompressedImages((prev) => {
      const compressedToRemove = prev.find((p) => p.id === fileId);
      if (compressedToRemove) {
        URL.revokeObjectURL(compressedToRemove.compressedUrl);
      }
      return prev.filter((p) => p.id !== fileId);
    });
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    // Clean up all previews and compressed URLs
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    compressedImages.forEach((img) => {
      URL.revokeObjectURL(img.compressedUrl);
    });
    setFiles([]);
    setCompressedImages([]);
    setProcessingProgress(0);
  }, [files, compressedImages]);

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
            maxFiles={1}
            onFilesSelected={handleFilesSelected}
            acceptedFileTypes={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
            label="Upload Image"
            description="Select an image to compress"
            disclaimer="Images are processed securely and not stored on our servers"
          />
        ) : (
          <div className="space-y-6">
            {/* Files Info */}
            <div className="p-4 border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">1 image selected</h3>
                  <p className="text-sm text-muted-foreground">Size: {formatFileSize(files[0]?.file.size || 0)}</p>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {compressedImages.length === 0 && (
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
                      onClick={() => removeFile(files[0]?.id as string)}
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Process Button */}
            {compressedImages.length === 0 && (
              <div className="flex flex-row gap-4">
                <Button
                  onClick={compressImages}
                  disabled={isProcessing}
                  size="lg"
                  className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Compress Image
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={reset} size="lg" className="flex-1">
                  Clear
                </Button>
              </div>
            )}

            {/* Processing Results */}
            {compressedImages.length > 0 && (
              <div className="space-y-6">
                {/* Success Banner */}
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-blue-100 rounded-full dark:bg-blue-900/30">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Image Compressed Successfully!</h4>
                  </div>
                  <div className="flex flex-col gap-3 mt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Reduced by {compressedImages[0]?.compressionRatio.toFixed(1)}% (
                      {formatFileSize(compressedImages[0]?.compressedBlob.size || 0)})
                    </p>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={reset}
                        className="flex-1 text-blue-800 border-blue-200 sm:flex-none bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 dark:border-blue-800 dark:text-blue-200"
                      >
                        Start Over
                      </Button>
                      <Button
                        onClick={() => downloadImage(compressedImages[0] as CompressedImage)}
                        size="sm"
                        className="flex-1 text-white bg-blue-600 sm:flex-none hover:bg-blue-700"
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
                    <div className="relative overflow-hidden border rounded-xl aspect-square bg-secondary border-border">
                      {files[0]?.preview && (
                        // biome-ignore lint/performance/noImgElement: <Required for image preview because nextjs Image cannot be used for object URLs>
                        <img src={files[0].preview} alt="Original" className="absolute inset-0 object-contain" />
                      )}
                    </div>
                  </div>

                  {/* Compressed Image */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Compressed Image</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(compressedImages[0]?.compressedBlob.size || 0)}
                      </span>
                    </div>
                    <div className="relative overflow-hidden border border-blue-200 rounded-xl aspect-square bg-secondary dark:border-blue-900">
                      {/* biome-ignore lint/performance/noImgElement: <Required for image preview because nextjs Image cannot be used for object URLs> */}
                      <img
                        src={compressedImages[0]?.compressedUrl}
                        alt="Compressed"
                        className="absolute inset-0 object-contain"
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
            <span className="text-sm font-medium">Compressing image...</span>
            <span className="text-sm text-muted-foreground">{Math.round(processingProgress)}%</span>
          </div>
          <Progress value={processingProgress} className="w-full h-2" />
        </div>
      )}

      {/* Warning */}
      <Alert className="max-w-3xl mx-auto mt-6 text-yellow-800 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        <AlertTitle>Compression Notice</AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          Image compression reduces file size by optimizing quality and dimensions. Results may vary based on the original image.
        </AlertDescription>
      </Alert>
    </div>
  );
}
