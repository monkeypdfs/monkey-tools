"use client";

import QRCode from "qrcode";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";
import { Download, QrCode, Loader2, AlertTriangle, CheckCircle, Link } from "lucide-react";

export default function QRCodeGenerator() {
  const [url, setUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate QR Code
  const generateQRCode = useCallback(async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL (include http:// or https://)");
      return;
    }

    setIsGenerating(true);

    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeUrl(qrDataUrl);
      toast.success("QR code generated successfully!");
    } catch (error) {
      console.error("QR code generation error:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  }, [url]);

  // Download QR Code
  const downloadQRCode = useCallback(() => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  }, [qrCodeUrl]);

  // Reset
  const reset = useCallback(() => {
    setUrl("");
    setQrCodeUrl(null);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Input Section */}
        <section aria-labelledby="input-section" className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url-input" className="text-sm font-medium">
                Enter URL
              </Label>
              <div className="relative">
                <Link className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 pl-10 text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      generateQRCode();
                    }
                  }}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                onClick={generateQRCode}
                disabled={isGenerating || !url.trim()}
                size="lg"
                className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>

              {qrCodeUrl && (
                <Button variant="outline" onClick={reset} size="lg" className="flex-1">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* QR Code Display */}
        {qrCodeUrl && (
          <section aria-labelledby="qr-display" className="max-w-2xl mx-auto mt-8">
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="p-4 border rounded-lg border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">QR Code Generated!</h4>
                </div>
                <div className="flex flex-col gap-3 mt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Your QR code is ready for download and sharing.
                  </p>
                  <Button
                    onClick={downloadQRCode}
                    size="sm"
                    className="w-full text-white bg-emerald-600 sm:w-auto hover:bg-emerald-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="relative p-6 bg-white shadow-lg rounded-xl dark:bg-gray-900">
                  <div className="relative">
                    {/* biome-ignore lint/performance/noImgElement: <Required for QR code display> */}
                    <img src={qrCodeUrl} alt="Generated QR Code" className="w-64 h-64" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xs break-all text-muted-foreground">{url}</p>
                  </div>
                </div>
              </div>

              {/* Usage Tips */}
              <Alert className="text-blue-800 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-200">
                <QrCode className="w-4 h-4 text-blue-600" />
                <AlertTitle>QR Code Tips</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                    <li>Scan with any QR code reader app on your phone</li>
                    <li>Print for physical use (posters, business cards, etc.)</li>
                    <li>Test the QR code before sharing to ensure it works</li>
                    <li>Keep URLs short for better QR code readability</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </section>
        )}

        {/* Warning for empty state */}
        {!qrCodeUrl && (
          <Alert className="max-w-2xl mx-auto mt-6 text-yellow-800 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertTitle>Getting Started</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Enter a valid URL above and click "Generate QR Code" to create your QR code. Make sure to include the protocol
              (http:// or https://).
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
