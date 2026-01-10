"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import ReactCrop, { type Crop as CropType, type PixelCrop } from "react-image-crop";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";
import { Download, Loader2, ImageIcon, Trash2, Crop, CheckCircle } from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";

interface CroppedImage {
  blob: Blob;
  url: string;
  fileName: string;
}

export default function CropImage() {
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [croppedImage, setCroppedImage] = useState<CroppedImage | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const cleanup = useCallback(() => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
    }
    if (croppedImage) {
      URL.revokeObjectURL(croppedImage.url);
      setCroppedImage(null);
    }
  }, [imageSrc, croppedImage]);

  const handleFileSelect = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      const file = files[0];
      if (!file) return;

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }

      cleanup();
      setSelectedFile(file);
      setCroppedImage(null);
      setCrop(undefined);
      setCompletedCrop(undefined);

      const url = URL.createObjectURL(file);
      setImageSrc(url);
    },
    [cleanup],
  );

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    // Set initial crop to 80% of image centered
    const cropWidth = width * 0.8;
    const cropHeight = height * 0.8;
    const x = (width - cropWidth) / 2;
    const y = (height - cropHeight) / 2;

    setCrop({
      unit: "px",
      x,
      y,
      width: cropWidth,
      height: cropHeight,
    });
  }, []);

  const getCroppedImg = useCallback(async (image: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error("Canvas not available"));
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = pixelCrop.width * scaleX;
      canvas.height = pixelCrop.height * scaleY;

      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.95,
      );
    });
  }, []);

  const handleCrop = useCallback(async () => {
    if (!imgRef.current || !completedCrop || !selectedFile) return;

    setIsProcessing(true);

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const croppedUrl = URL.createObjectURL(croppedBlob);

      const fileName = `${selectedFile.name.replace(/\.[^/.]+$/, "")}_cropped.jpg`;

      setCroppedImage({
        blob: croppedBlob,
        url: croppedUrl,
        fileName,
      });

      toast.success("Image cropped successfully!");
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Failed to crop image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, selectedFile, getCroppedImg]);

  const downloadCroppedImage = useCallback(() => {
    if (!croppedImage) return;

    const link = document.createElement("a");
    link.href = croppedImage.url;
    link.download = croppedImage.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Image downloaded!");
  }, [croppedImage]);

  const resetCrop = useCallback(() => {
    cleanup();
    setSelectedFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [cleanup]);

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Show upload interface only when no file selected */}
        {!selectedFile && (
          <section className="max-w-4xl mx-auto mb-8">
            <div className="space-y-4">
              <FileUpload
                onFilesSelected={handleFileSelect}
                acceptedFileTypes={["image/*"]}
                maxFiles={1}
                maxFileSize={50} // 50MB
              />
            </div>
          </section>
        )}

        {/* Main cropping interface with sidebar */}
        {selectedFile && !croppedImage && (
          <div className="max-w-7xl mx-auto my-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Crop Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* File Info Header */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                </div>

                {/* Crop Area with Corner and Side Handles */}
                {imageSrc && (
                  <div className="relative bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-center">
                      <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} ruleOfThirds>
                        {/** biome-ignore lint/performance/noImgElement: <Required native img element here> */}
                        <img
                          ref={imgRef}
                          src={imageSrc}
                          alt="Crop preview"
                          onLoad={onImageLoad}
                          style={{ maxWidth: "100%", maxHeight: "70vh" }}
                        />
                      </ReactCrop>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button size="lg" onClick={handleCrop} disabled={!completedCrop || isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cropping...
                      </>
                    ) : (
                      <>
                        <Crop className="w-4 h-4" />
                        Crop Image
                      </>
                    )}
                  </Button>
                  <Button size="lg" variant="outline" onClick={resetCrop}>
                    <Trash2 className="size-4" />
                    Reset
                  </Button>
                </div>

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processing image...</span>
                    </div>
                    <Progress value={100} className="w-full h-2" />
                  </div>
                )}
              </div>

              {/* Sidebar Controls */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Crop Settings */}
                  <div className="bg-card border rounded-lg p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <Crop className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Crop Settings</h3>
                    </div>

                    {/* Crop Info */}
                    {completedCrop && (
                      <div className="space-y-2 p-3 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium">Selection Info</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Width: {Math.round(completedCrop.width)}px</div>
                          <div>Height: {Math.round(completedCrop.height)}px</div>
                          <div>Aspect: {(completedCrop.width / completedCrop.height).toFixed(2)}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tips */}
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertTitle>Cropping Tips</AlertTitle>
                    <AlertDescription className="text-sm">
                      <ul className="mt-2 space-y-1">
                        <li>• Drag corners to resize proportionally</li>
                        <li>• Drag sides to resize in one direction</li>
                        <li>• Drag center to reposition</li>
                        <li>• Click "Crop Image" when ready</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results - Always show when available */}
        {croppedImage && (
          <section className="max-w-4xl mx-auto my-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold">Cropped Image</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Original</h3>
                  <div className="relative min-h-50 max-h-100 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={imageSrc || ""}
                      alt="Original"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Cropped */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Cropped</h3>
                  <div className="relative min-h-50 max-h-100 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={croppedImage.url}
                      alt="Cropped"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium block truncate">{croppedImage.fileName}</span>
                    <span className="text-sm text-muted-foreground">({formatFileSize(croppedImage.blob.size)})</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button onClick={downloadCroppedImage} className="gap-2">
                    <Download className="size-4" />
                    Download
                  </Button>
                  <Button variant="secondary" onClick={resetCrop} className="gap-2">
                    <Trash2 className="size-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
