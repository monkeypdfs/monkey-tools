"use client";

import { toast } from "sonner";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { useState, useCallback, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Progress } from "@workspace/ui/components/progress";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";
import { Download, Loader2, ImageIcon, Trash2, Crop, CheckCircle } from "lucide-react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CroppedImage {
  blob: Blob;
  url: string;
  fileName: string;
}

export default function CropImage() {
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [croppedImage, setCroppedImage] = useState<CroppedImage | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

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

      const url = URL.createObjectURL(file);
      setImageSrc(url);
    },
    [cleanup],
  );

  const onCropComplete = useCallback((_croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async (imageSrc: string, pixelCrop: CropArea): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
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

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height,
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
      };
      image.onerror = () => reject(new Error("Failed to load image"));
      image.src = imageSrc;
    });
  }, []);

  const handleCrop = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels || !selectedFile) return;

    setIsProcessing(true);

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
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
  }, [imageSrc, croppedAreaPixels, selectedFile, getCroppedImg]);

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
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspectRatio(null);
    setCroppedAreaPixels(null);
  }, [cleanup]);

  const aspectRatioOptions = [
    { label: "Free", value: null },
    { label: "1:1 (Square)", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
    { label: "3:2", value: 3 / 2 },
    { label: "2:3", value: 2 / 3 },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Show upload/crop interface only when no results */}
        {!croppedImage && (
          <>
            {/* File Upload Section */}
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

            {/* Selected File Info */}
            {selectedFile && (
              <section className="max-w-4xl mx-auto my-8">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                </div>
              </section>
            )}

            {/* Crop Interface */}
            {imageSrc && (
              <section className="max-w-4xl mx-auto mb-8">
                <div className="space-y-6">
                  {/* Aspect Ratio Selection */}
                  <div className="flex flex-wrap gap-2">
                    <Label className="text-sm font-medium mr-4">Aspect Ratio:</Label>
                    {aspectRatioOptions.map((option) => (
                      <Button
                        key={option.label}
                        variant={aspectRatio === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAspectRatio(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>

                  {/* Crop Area */}
                  <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspectRatio || undefined}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>

                  {/* Zoom Control */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Zoom: {Math.round(zoom * 100)}%</Label>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <Button size={"lg"} onClick={handleCrop} disabled={!croppedAreaPixels || isProcessing}>
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
                    <Button size={"lg"} variant="outline" onClick={resetCrop}>
                      <Trash2 className="size-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* Processing Progress */}
            {isProcessing && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing image...</span>
                  </div>
                  <Progress value={100} className="w-full h-2" />
                </div>
              </div>
            )}
          </>
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

        {/* Tips */}
        <Alert className="max-w-4xl mx-auto">
          <CheckCircle className="w-4 h-4" />
          <AlertTitle>Cropping Tips</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Use the zoom slider to get a closer look at your image</li>
              <li>• Choose preset aspect ratios for consistent cropping</li>
              <li>• Drag to reposition the crop area</li>
              <li>• The cropped image will be saved as JPEG format</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
