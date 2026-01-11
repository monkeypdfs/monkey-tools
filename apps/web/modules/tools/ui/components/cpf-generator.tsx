"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { Copy, RefreshCw, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

function generateCPF(formatted = true): string {
  // Generate first 9 random digits
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  // Calculate first check digit
  const d1 = 11 - (base.reduce((sum, num, i) => sum + num * (10 - i), 0) % 11);
  base.push(d1 >= 10 ? 0 : d1);

  // Calculate second check digit
  const d2 = 11 - (base.reduce((sum, num, i) => sum + num * (11 - i), 0) % 11);
  base.push(d2 >= 10 ? 0 : d2);

  const cpf = base.join("");

  if (!formatted) return cpf;

  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;

  // Check for all same digits (e.g. 111.111.111-11) which are invalid
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const calc = (len: number) =>
    11 -
    (cleaned
      .slice(0, len)
      .split("")
      .reduce((sum, d, i) => sum + Number(d) * (len + 1 - i), 0) %
      11);

  const d1 = calc(9);
  const d2 = calc(10);

  return Number(cleaned[9]) === (d1 >= 10 ? 0 : d1) && Number(cleaned[10]) === (d2 >= 10 ? 0 : d2);
}

export default function CpfGenerator() {
  const [generatedCpf, setGeneratedCpf] = useState("");
  const [formatted, setFormatted] = useState(true);
  const [validationCpf, setValidationCpf] = useState("");

  const handleGenerate = () => {
    const cpf = generateCPF(formatted);
    setGeneratedCpf(cpf);
  };

  const handleCopy = async () => {
    if (!generatedCpf) return;
    try {
      await navigator.clipboard.writeText(generatedCpf);
      toast.success("CPF copied to clipboard");
    } catch {
      toast.error("Failed to copy CPF");
    }
  };

  const updateFormat = (checked: boolean) => {
    setFormatted(checked);
    // Regenerate or re-format if existing
    if (generatedCpf) {
      const raw = generatedCpf.replace(/\D/g, "");
      if (checked) {
        setGeneratedCpf(raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"));
      } else {
        setGeneratedCpf(raw);
      }
    }
  };

  const isValid = validationCpf ? validateCPF(validationCpf) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Generator Section */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Generator
            </h2>
            <div className="flex items-center space-x-2">
              <Label htmlFor="format-mode" className="text-sm text-muted-foreground">
                Format (XXX.XXX.XXX-XX)
              </Label>
              <Switch id="format-mode" checked={formatted} onCheckedChange={updateFormat} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Generate valid CPF numbers for testing purposes.</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Input value={generatedCpf} readOnly placeholder="Click generate" className="pr-12 font-mono text-lg" />
            {generatedCpf && (
              <Button size="icon" variant="ghost" className="absolute w-8 h-8 right-1 top-1" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button onClick={handleGenerate} className="min-w-35">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate CPF
          </Button>
        </div>

        <div className="p-3 text-xs border rounded-md text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">
          <strong>⚠️ Disclaimer:</strong> These numbers are mathematically valid but randomly generated. Use them for{" "}
          <strong>testing and educational purposes only</strong>. Do not use them for fraudulent activities or real-world identity
          verification.
        </div>
      </Card>

      {/* Validator Section */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Validator</h2>
          <p className="text-sm text-muted-foreground">Check if a CPF number is valid according to the official algorithm.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cpf-validate">Enter CPF</Label>
            <Input
              id="cpf-validate"
              value={validationCpf}
              onChange={(e) => setValidationCpf(e.target.value)}
              placeholder="000.000.000-00 or 00000000000"
              className="font-mono"
            />
          </div>

          {validationCpf && (
            <div
              className={cn(
                "flex items-center gap-2 p-3 rounded-md border",
                isValid
                  ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400"
                  : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400",
              )}
            >
              {isValid ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Valid CPF</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Invalid CPF</span>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
