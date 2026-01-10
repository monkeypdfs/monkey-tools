"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";
import { Download, ImageIcon, Trash2, FlipHorizontal, FlipVertical, RotateCcw, CheckCircle } from "lucide-react";

export default function FlipImage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFlip, setCurrentFlip] = useState<{ horizontal: boolean; vertical: boolean }>({
    horizontal: false,
    vertical: false,
  });

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
  }, [imageSrc]);

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
      setCurrentFlip({ horizontal: false, vertical: false });

      const url = URL.createObjectURL(file);
      setImageSrc(url);
    },
    [cleanup],
  );

  const handleFlip = useCallback(
    async (type: "horizontal" | "vertical" | "both") => {
      setIsProcessing(true);

      try {
        // Update the flip state immediately for visual feedback
        if (type === "horizontal") {
          setCurrentFlip((prev) => ({ ...prev, horizontal: !prev.horizontal }));
          toast.success(currentFlip.horizontal ? "Horizontal flip removed" : "Flipped horizontally!");
        } else if (type === "vertical") {
          setCurrentFlip((prev) => ({ ...prev, vertical: !prev.vertical }));
          toast.success(currentFlip.vertical ? "Vertical flip removed" : "Flipped vertically!");
        } else {
          setCurrentFlip((prev) => ({ horizontal: !prev.horizontal, vertical: !prev.vertical }));
          toast.success("Flipped both directions!");
        }
      } catch (error) {
        console.error("Error flipping image:", error);
        toast.error("Failed to flip image. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [currentFlip],
  );

  const downloadImage = useCallback(async () => {
    if (!imageSrc || !selectedFile) return;

    try {
      const image = new window.Image();
      image.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = imageSrc;
      });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = image.width;
      canvas.height = image.height;

      ctx.save();

      // Apply flip transformations based on current state
      if (currentFlip.horizontal && currentFlip.vertical) {
        ctx.scale(-1, -1);
        ctx.translate(-canvas.width, -canvas.height);
      } else if (currentFlip.horizontal) {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      } else if (currentFlip.vertical) {
        ctx.scale(1, -1);
        ctx.translate(0, -canvas.height);
      }

      ctx.drawImage(image, 0, 0);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const flipSuffix =
              currentFlip.horizontal && currentFlip.vertical
                ? "_flipped_both"
                : currentFlip.horizontal
                  ? "_flipped_horizontal"
                  : currentFlip.vertical
                    ? "_flipped_vertical"
                    : "";
            link.download = `${selectedFile.name.replace(/\.[^/.]+$/, "")}${flipSuffix}.jpg`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Image downloaded!");
          }
        },
        "image/jpeg",
        0.95,
      );
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image.");
    }
  }, [imageSrc, selectedFile, currentFlip]);

  const resetFlip = useCallback(() => {
    setCurrentFlip({ horizontal: false, vertical: false });
    toast.success("Flips reset!");
  }, []);

  const resetAll = useCallback(() => {
    cleanup();
    setSelectedFile(null);
    setCurrentFlip({ horizontal: false, vertical: false });
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

        {/* Main flipping interface */}
        {selectedFile && (
          <div className="max-w-7xl mx-auto my-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Image Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* File Info Header */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                </div>

                {/* Image Preview */}
                {imageSrc && (
                  <div className="relative h-96 lg:h-125 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt="Flipped preview"
                      fill
                      className="object-contain transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      style={{
                        transform: `scale(${currentFlip.horizontal ? -1 : 1}, ${currentFlip.vertical ? -1 : 1})`,
                      }}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => handleFlip("horizontal")}
                    disabled={isProcessing}
                    className={currentFlip.horizontal ? "bg-primary" : ""}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    Flip Horizontal
                  </Button>
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => handleFlip("vertical")}
                    disabled={isProcessing}
                    className={currentFlip.vertical ? "bg-primary" : ""}
                  >
                    <FlipVertical className="w-4 h-4" />
                    Flip Vertical
                  </Button>
                  <Button size="lg" variant="default" onClick={() => handleFlip("both")} disabled={isProcessing}>
                    <RotateCcw className="w-4 h-4" />
                    Flip Both
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={resetFlip}
                    disabled={!currentFlip.horizontal && !currentFlip.vertical}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Flips
                  </Button>
                </div>

                {/* Download Button */}
                {(currentFlip.horizontal || currentFlip.vertical) && (
                  <div className="flex justify-center">
                    <Button size="lg" variant="default" onClick={downloadImage} className="gap-2">
                      <Download className="w-4 h-4" />
                      Download Flipped Image
                    </Button>
                  </div>
                )}

                {/* Upload New Button */}
                <div className="flex justify-center">
                  <Button size="lg" variant="outline" onClick={resetAll} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Upload New Image
                  </Button>
                </div>
              </div>

              {/* Sidebar Controls */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Flip Status */}
                  <div className="bg-card border rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <FlipHorizontal className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Current Status</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">Horizontal</span>
                        <span
                          className={`text-sm font-medium ${currentFlip.horizontal ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {currentFlip.horizontal ? "Flipped" : "Normal"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">Vertical</span>
                        <span
                          className={`text-sm font-medium ${currentFlip.vertical ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {currentFlip.vertical ? "Flipped" : "Normal"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertTitle>Flipping Tips</AlertTitle>
                    <AlertDescription className="text-sm">
                      <ul className="mt-2 space-y-1">
                        <li>• Horizontal flip mirrors left to right</li>
                        <li>• Vertical flip mirrors top to bottom</li>
                        <li>• Combine both for 180° rotation</li>
                        <li>• Download when you're satisfied</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
