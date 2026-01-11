"use client";

import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Download, Table as TableIcon, Trash2, Code, FileSpreadsheet, RefreshCw } from "lucide-react";

type InputMode = "paste" | "upload";

interface ParsedSheet {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: Generic JSON data
  data: any[];
}

export default function JsonToExcelConverter() {
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [jsonInput, setJsonInput] = useState("");
  const [sheets, setSheets] = useState<ParsedSheet[] | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [fileName, setFileName] = useState("data");
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/suspicious/noExplicitAny: Recursive flattener utility
  const flattenObject = useCallback((obj: any, prefix = ""): any => {
    // biome-ignore lint/suspicious/noExplicitAny: Accumulator
    return Object.keys(obj).reduce((acc: any, k) => {
      const pre = prefix.length ? `${prefix}.` : "";
      if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else if (Array.isArray(obj[k])) {
        // If we encounter an array here, it wasn't extracted to a sheet.
        // Join primitives or stringify objects
        if (obj[k].length > 0 && typeof obj[k][0] !== "object") {
          acc[pre + k] = obj[k].join(", ");
        } else {
          acc[pre + k] = JSON.stringify(obj[k]);
        }
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  }, []);

  const handleJsonParse = useCallback((input: string, sourceName = "data") => {
    try {
      const parsed = JSON.parse(input);
      const generatedSheets: ParsedSheet[] = [];

      if (Array.isArray(parsed)) {
        if (parsed.length === 0) throw new Error("JSON array is empty.");
        generatedSheets.push({ name: "Sheet1", data: parsed });
      } else if (typeof parsed === "object" && parsed !== null) {
        // Heuristic: Check for properties that are arrays of objects
        // biome-ignore lint/suspicious/noExplicitAny: Generic JSON input
        const rootObject: Record<string, any> = {};
        let hasExtractedArrays = false;

        Object.entries(parsed).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
            // This property is a candidate for its own sheet
            generatedSheets.push({ name: key.substring(0, 31), data: value });
            hasExtractedArrays = true;
          } else if (Array.isArray(value)) {
            // Array of primitives - flatten to string
            rootObject[key] = value.join(", ");
          } else {
            rootObject[key] = value;
          }
        });

        // If we extracted arrays, we might still have a "root" object with metadata
        if (hasExtractedArrays) {
          if (Object.keys(rootObject).length > 0) {
            generatedSheets.unshift({ name: "Overview", data: [rootObject] });
          }
        } else {
          // No arrays found, just treat the whole object as one row
          generatedSheets.push({ name: "Sheet1", data: [parsed] });
        }
      } else {
        throw new Error("JSON must be an array or an object.");
      }

      if (generatedSheets.length === 0) {
        throw new Error("No valid data found to convert.");
      }

      setSheets(generatedSheets);
      setActiveSheetIndex(0);
      setFileName(sourceName.replace(/\.json$/i, ""));
      setError(null);
      toast.success(`Successfully parsed ${generatedSheets.length} sheet(s)!`);
    } catch (err) {
      setError((err as Error).message);
      setSheets(null);
      toast.error("Invalid JSON format");
    }
  }, []);

  const handleFileUpload = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const file = files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setJsonInput(text); // Also populate text area
        handleJsonParse(text, file.name);
      };
      reader.readAsText(file);
      setInputMode("paste"); // Switch to view the content
    },
    [handleJsonParse],
  );

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    if (e.target.value.trim() === "") {
      setSheets(null);
      setError(null);
      return;
    }
  };

  const processInput = () => {
    if (!jsonInput.trim()) {
      setError("Please enter some JSON data.");
      return;
    }
    handleJsonParse(jsonInput, fileName);
  };

  const downloadExcel = () => {
    if (!sheets) return;

    try {
      const workbook = XLSX.utils.book_new();

      for (const sheet of sheets) {
        const processedData = sheet.data.map((item) => flattenObject(item));
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
      }

      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      toast.success("Excel file downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Excel file.");
    }
  };

  const clearAll = () => {
    setJsonInput("");
    setSheets(null);
    setFileName("data");
    setError(null);
    setActiveSheetIndex(0);
  };

  // Preview logic
  const activeSheet = sheets ? sheets[activeSheetIndex] : null;
  const previewData = activeSheet ? activeSheet.data.slice(0, 5) : [];
  // biome-ignore lint/suspicious/noExplicitAny: Preview helper
  const getHeaders = (data: any[]) => {
    if (!data || data.length === 0) return [];
    // Flatten the first item to get representative headers
    // We reuse the simple flatten logic for preview headers to match output
    return Object.keys(flattenObject(data[0]));
  };

  const headers = previewData.length > 0 ? getHeaders([previewData[0]]) : [];

  // Helper to render cell value for preview
  // biome-ignore lint/suspicious/noExplicitAny: Render helper
  const renderCellValue = (val: any) => {
    if (typeof val === "object" && val !== null) {
      if (Array.isArray(val)) return `[Array(${val.length})]`;
      return JSON.stringify(val);
    }
    return String(val ?? "");
  };

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-8">
          {/* Input Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">1. Input JSON Data</h2>
            <p className="text-muted-foreground">
              Paste your JSON data below or upload a .json file to convert it to an Excel spreadsheet.
            </p>

            <div className="flex items-center gap-4 p-1 mb-4 rounded-lg bg-muted w-fit">
              <Button variant={inputMode === "paste" ? "default" : "ghost"} onClick={() => setInputMode("paste")} size="sm">
                <Code className="w-4 h-4 mr-2" />
                Paste JSON
              </Button>
              <Button variant={inputMode === "upload" ? "default" : "ghost"} onClick={() => setInputMode("upload")} size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>

            {inputMode === "paste" ? (
              <div className="space-y-4 duration-200 animate-in fade-in zoom-in-95">
                <div className="relative border rounded-lg shadow-xs h-96">
                  <Textarea
                    placeholder='[{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]'
                    className="w-full h-full p-4 font-mono text-xs border-0 resize-none focus-visible:ring-0 sm:text-sm"
                    value={jsonInput}
                    onChange={handlePasteChange}
                  />
                  <div className="absolute flex gap-2 bottom-4 right-4">
                    <Button size="sm" variant="secondary" onClick={clearAll} disabled={!jsonInput} className="shadow-sm">
                      <Trash2 className="w-3 h-3 mr-2" />
                      Clear
                    </Button>
                    <Button size="sm" onClick={processInput} disabled={!jsonInput} className="shadow-sm">
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Process JSON
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center border-2 border-dashed rounded-lg h-96 border-muted bg-muted/20 animate-in fade-in zoom-in-95">
                <FileUpload
                  onFilesSelected={handleFileUpload}
                  acceptedFileTypes={["application/json"]}
                  maxFiles={1}
                  maxFileSize={10} // 10MB
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error Parsing JSON</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Preview & Output Section - Only show if sheets exist or we want to show placeholder */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">2. Preview & Export</h2>
            <p className="text-muted-foreground">Verify your data structure before downloading.</p>

            <Card className="overflow-hidden border shadow-sm h-fit">
              <div className="flex flex-col p-0">
                <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Data Preview</h3>
                  </div>
                  {sheets && activeSheet && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 font-mono text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                        {activeSheet.data.length} Rows
                      </span>
                    </div>
                  )}
                </div>

                {/* Sheet Tabs */}
                {sheets && sheets.length > 1 && (
                  <div className="flex gap-2 px-4 pt-4 pb-0 overflow-x-auto border-b bg-background">
                    {sheets.map((sheet, idx) => (
                      <button
                        type="button"
                        key={sheet.name}
                        onClick={() => setActiveSheetIndex(idx)}
                        className={`
                                                        px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                                        ${
                                                          activeSheetIndex === idx
                                                            ? "border-primary text-primary"
                                                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                                                        }
                                                    `}
                      >
                        {sheet.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative overflow-auto min-h-75 max-h-125 bg-background">
                  {sheets && activeSheet ? (
                    <div className="min-w-max">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="sticky top-0 z-10 text-xs uppercase shadow-xs bg-muted/90 backdrop-blur-sm text-muted-foreground">
                          <tr>
                            {headers.map((header) => (
                              <th
                                key={header}
                                className="px-6 py-3 font-medium tracking-wider border-b border-r last:border-r-0 border-border"
                                title={header}
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {/* biome-ignore lint/suspicious/noExplicitAny: <Transient types> */}
                          {previewData.map((originalRow: any, i) => {
                            // Flatten row for display matching headers
                            const row = flattenObject(originalRow);

                            return (
                              <tr key={`row-${i * 2}`} className="transition-colors hover:bg-secondary">
                                {headers.map((header) => (
                                  <td
                                    key={`${i}-${header}`}
                                    className="px-6 py-3 truncate border-r max-w-75 last:border-r-0 border-border"
                                    title={String(row[header])}
                                  >
                                    {renderCellValue(row[header])}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {activeSheet.data.length > 5 && (
                        <div className="sticky bottom-0 left-0 right-0 p-3 text-xs font-medium text-center border-t bg-background/95 backdrop-blur-sm text-muted-foreground">
                          And {activeSheet.data.length - 5} more rows...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-75 text-muted-foreground">
                      <div className="p-4 mb-4 rounded-full bg-secondary">
                        <FileSpreadsheet className="w-8 h-8 opacity-40" />
                      </div>
                      <p className="font-medium">No data loaded</p>
                      <p className="text-sm opacity-70">Import JSON to see the preview</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-6 p-6 border-t bg-muted/10 sm:flex-row sm:items-center">
                  <div className="flex-1 w-full space-y-2">
                    <Label htmlFor="filename">Filename</Label>
                    <div className="flex items-center max-w-sm gap-2">
                      <Input
                        id="filename"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="filename"
                        className="bg-background"
                      />
                      <span className="text-sm font-medium text-muted-foreground">.xlsx</span>
                    </div>
                  </div>
                  <Button className="w-full shadow-md sm:w-auto" size="lg" onClick={downloadExcel} disabled={!sheets}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Excel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
