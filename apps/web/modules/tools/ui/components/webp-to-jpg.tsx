"use client";

import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { useState, useCallback, useEffect } from "react";
import { HowToStep } from "@/modules/common/ui/components/how-to-step";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";
import { Download, Loader2, ImageIcon, AlertTriangle, Trash2, Shuffle, CheckCircle } from "lucide-react";

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

interface ConvertedImage {
  originalFile: File;
  convertedBlob: Blob;
  convertedUrl: string;
  id: string;
  sizeChange: number;
}

export default function WebpToJpg() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);

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

  // Clean up converted URLs on unmount or when converted images change
  useEffect(() => {
    return () => {
      convertedImages.forEach((img) => {
        URL.revokeObjectURL(img.convertedUrl);
      });
    };
  }, [convertedImages]);

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
    setConvertedImages([]); // Reset any previous results
  }, []);

  // Convert WebP to JPG using canvas
  const convertToJpg = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert to JPG"));
            }
          },
          "image/jpeg",
          0.9,
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  // Convert images
  const convertImages = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setConvertedImages([]);

    try {
      const results: ConvertedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const uploadedFile = files[i];

        if (!uploadedFile) continue;

        try {
          setProcessingProgress((i / files.length) * 100);

          const convertedBlob = await convertToJpg(uploadedFile.file);

          // Create object URL for the converted image
          const convertedUrl = URL.createObjectURL(convertedBlob);

          const sizeChange = ((convertedBlob.size - uploadedFile.file.size) / uploadedFile.file.size) * 100;

          results.push({
            originalFile: uploadedFile.file,
            convertedBlob,
            convertedUrl,
            id: uploadedFile.id,
            sizeChange,
          });

          setProcessingProgress(((i + 1) / files.length) * 100);
        } catch (error) {
          console.error(`Failed to convert ${uploadedFile.file.name}:`, error);
          toast.error(`Failed to convert ${uploadedFile.file.name}`);
        }
      }

      if (results.length > 0) {
        setConvertedImages(results);
        toast.success("Image converted successfully!");
      } else {
        toast.error("Failed to convert the image");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error(error instanceof Error ? error.message : "Image conversion failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Download converted image
  const downloadImage = useCallback((convertedImage: ConvertedImage) => {
    const link = document.createElement("a");
    link.href = convertedImage.convertedUrl;
    link.download = `${convertedImage.originalFile.name.replace(/\.webp$/i, "")}.jpg`;
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
    setConvertedImages((prev) => {
      const convertedToRemove = prev.find((p) => p.id === fileId);
      if (convertedToRemove) {
        URL.revokeObjectURL(convertedToRemove.convertedUrl);
      }
      return prev.filter((p) => p.id !== fileId);
    });
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    // Clean up all previews and converted URLs
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    convertedImages.forEach((img) => {
      URL.revokeObjectURL(img.convertedUrl);
    });
    setFiles([]);
    setConvertedImages([]);
    setProcessingProgress(0);
  }, [files, convertedImages]);

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
              acceptedFileTypes={["image/webp"]}
              label="Upload WebP Image"
              description="Select a WebP image to convert to JPG"
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
              {convertedImages.length === 0 && (
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
              {convertedImages.length === 0 && (
                <div className="flex flex-row gap-4">
                  <Button
                    onClick={convertImages}
                    disabled={isProcessing}
                    size="lg"
                    className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Shuffle className="w-4 h-4 mr-2" />
                        Convert to JPG
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={reset} size="lg" className="flex-1">
                    Clear
                  </Button>
                </div>
              )}

              {/* Processing Results */}
              {convertedImages.length > 0 && (
                <div className="space-y-6">
                  {/* Success Banner */}
                  <div className="p-4 border rounded-lg border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20 dark:border-cyan-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30">
                        <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <h4 className="font-semibold text-cyan-800 dark:text-cyan-200">Image Converted Successfully!</h4>
                    </div>
                    <div className="flex flex-col gap-3 mt-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-cyan-700 dark:text-cyan-300">
                        {(() => {
                          // biome-ignore lint/style/noNonNullAssertion: convertedImages[0] is guaranteed to exist here
                          const firstConverted = convertedImages[0]!;
                          return firstConverted.sizeChange > 0
                            ? `Increased by ${firstConverted.sizeChange.toFixed(1)}%`
                            : `Reduced by ${Math.abs(firstConverted.sizeChange).toFixed(1)}%`;
                        })()} ({formatFileSize(convertedImages[0]?.convertedBlob.size || 0)})
                      </p>
                      <div className="flex w-full gap-2 sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={reset}
                          className="flex-1 text-cyan-800 border-cyan-200 sm:flex-none bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 dark:border-cyan-800 dark:text-cyan-200"
                        >
                          Start Over
                        </Button>
                        <Button
                          // biome-ignore lint/style/noNonNullAssertion: convertedImages[0] is guaranteed to exist here
                          onClick={() => downloadImage(convertedImages[0]!)}
                          size="sm"
                          className="flex-1 text-white bg-cyan-600 sm:flex-none hover:bg-cyan-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download JPG
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Image Comparison */}
                  <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
                    {/* Original Image */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Original WebP</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(files[0]?.file.size || 0)}</span>
                      </div>
                      <div className="relative overflow-hidden border rounded-xl aspect-square bg-muted/50 border-border">
                        {files[0]?.preview && (
                          // biome-ignore lint/performance/noImgElement: <Required for image preview because nextjs Image cannot be used for object URLs>
                          <img src={files[0].preview} alt="Original" className="absolute inset-0 object-contain" />
                        )}
                      </div>
                    </div>

                    {/* Converted Image */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Converted JPG</span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(convertedImages[0]?.convertedBlob.size || 0)}
                        </span>
                      </div>
                      <div className="relative overflow-hidden border border-cyan-200 rounded-xl aspect-square bg-muted/50 dark:border-cyan-900">
                        {/* biome-ignore lint/performance/noImgElement: <Required for image preview because nextjs Image cannot be used for object URLs> */}
                        <img src={convertedImages[0]?.convertedUrl} alt="Converted" className="absolute inset-0 object-contain" />
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
              <span className="text-sm font-medium">Converting image...</span>
              <span className="text-sm text-muted-foreground">{Math.round(processingProgress)}%</span>
            </div>
            <Progress value={processingProgress} className="w-full h-2" />
          </div>
        )}

        {/* Warning */}
        <Alert className="max-w-3xl mx-auto mt-6 text-yellow-800 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <AlertTitle>Conversion Notice</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            WebP to JPG conversion provides better compatibility. JPG format may have slightly different compression
            characteristics.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
