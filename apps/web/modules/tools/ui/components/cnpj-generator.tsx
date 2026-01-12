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

// Common utility functions
const calcDigit = (nums: number[], weights: number[]): number => {
  const sum = nums.reduce((acc, num, i) => acc + num * (weights[i] ?? 0), 0);
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
};

const formatCNPJ = (cnpj: string): string => {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

const cleanCNPJ = (cnpj: string): string => {
  return cnpj.replace(/\D/g, "");
};

function generateCNPJ(formatted = true, branch = "0001"): string {
  if (!/^\d{4}$/.test(branch)) {
    throw new Error("Branch must be a 4-digit string");
  }

  // Generate first 8 random digits
  const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));

  // Add branch (usually 0001)
  const numbers = [...base, ...branch.split("").map(Number)];

  // Weights for check digits
  const weight1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weight2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // First check digit
  const d1 = calcDigit(numbers, weight1);
  numbers.push(d1);

  // Second check digit
  const d2 = calcDigit(numbers, weight2);
  numbers.push(d2);

  const cnpj = numbers.join("");

  return formatted ? formatCNPJ(cnpj) : cnpj;
}

function validateCNPJ(cnpj: string): boolean {
  const cleaned = cleanCNPJ(cnpj);

  if (cleaned.length !== 14) return false;
  // Check for all same digits
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const nums = cleaned.split("").map(Number);

  const weight1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weight2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcDigit(nums.slice(0, 12), weight1);
  const d2 = calcDigit(nums.slice(0, 13), weight2);

  return nums[12] === d1 && nums[13] === d2;
}

export default function CnpjGenerator() {
  const [generatedCnpj, setGeneratedCnpj] = useState("");
  const [formatted, setFormatted] = useState(true);
  const [validationCnpj, setValidationCnpj] = useState("");

  const handleGenerate = () => {
    const cnpj = generateCNPJ(formatted);
    setGeneratedCnpj(cnpj);
  };

  const handleCopy = async () => {
    if (!generatedCnpj) return;
    try {
      await navigator.clipboard.writeText(generatedCnpj);
      toast.success("CNPJ copied to clipboard");
    } catch {
      toast.error("Failed to copy CNPJ");
    }
  };

  const updateFormat = (checked: boolean) => {
    setFormatted(checked);
    // Regenerate or re-format if existing
    if (generatedCnpj) {
      const raw = cleanCNPJ(generatedCnpj);
      setGeneratedCnpj(checked ? formatCNPJ(raw) : raw);
    }
  };

  const isValid = validationCnpj ? validateCNPJ(validationCnpj) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Generator Section */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Generator
            </h2>
            <div className="flex items-center space-x-2">
              <Label htmlFor="format-mode" className="text-sm text-muted-foreground whitespace-nowrap">
                Format (XX.XXX.XXX/0001-XX)
              </Label>
              <Switch id="format-mode" checked={formatted} onCheckedChange={updateFormat} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Generate valid CNPJ numbers for testing purposes.</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Input value={generatedCnpj} readOnly placeholder="Click generate" className="pr-12 font-mono text-lg" />
            {generatedCnpj && (
              <Button size="icon" variant="ghost" className="absolute w-8 h-8 right-1 top-1" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button onClick={handleGenerate} className="min-w-35">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate CNPJ
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
          <p className="text-sm text-muted-foreground">Check if a CNPJ number is valid according to the official algorithm.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj-validate">Enter CNPJ</Label>
            <Input
              id="cnpj-validate"
              value={validationCnpj}
              onChange={(e) => setValidationCnpj(e.target.value)}
              placeholder="00.000.000/0000-00 or 00000000000000"
              className="font-mono"
            />
          </div>

          {validationCnpj && (
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
                  <span className="font-medium">Valid CNPJ</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Invalid CNPJ</span>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
