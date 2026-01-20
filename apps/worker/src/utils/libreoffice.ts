import path from "node:path";
import { execFile } from "node:child_process";

export async function convertToPdf(inputPath: string, outputDir: string): Promise<string> {
  // Security: Ensure input path is absolute and exists
  // The execute function itself doesn't need to check too much if the worker is isolated,
  // but it's good practice.

  // We expect inputPath like /tmp/123-input.docx
  // soffice --headless --convert-to pdf --outdir /tmp /tmp/123-input.docx

  return new Promise((resolve, reject) => {
    // 30 second timeout
    const timeout = 30000;

    // Command: soffice --headless --convert-to pdf --outdir <outputDir> <inputPath>
    const args = ["--headless", "--convert-to", "pdf", "--outdir", outputDir, inputPath];

    execFile("soffice", args, { timeout }, (error) => {
      if (error) {
        // Check for timeout
        if (error instanceof Error && "signal" in error && error.signal === "SIGTERM") {
          return reject(new Error("Conversion timed out"));
        }
        return reject(error);
      }

      // LibreOffice usually names the output file same as input but with .pdf extension
      const filename = path.basename(inputPath, path.extname(inputPath));
      const expectedOutputPath = path.join(outputDir, `${filename}.pdf`);

      resolve(expectedOutputPath);
    });
  });
}

export async function convertToWord(inputPath: string, outputDir: string): Promise<string> {
  // Security: Ensure input path is absolute and exists
  // The execute function itself doesn't need to check too much if the worker is isolated,
  // but it's good practice.

  // We expect inputPath like /tmp/123-input.pdf
  // soffice --headless --convert-to docx --outdir /tmp /tmp/123-input.pdf

  return new Promise((resolve, reject) => {
    // 5 minutes timeout for PDF to Word (can be heavier)
    const timeout = 300000;

    // Command: soffice -env:UserInstallation=file:///tmp/LibreOffice_Conversion_${unique_id} --headless --infilter="writer_pdf_import" --convert-to docx --outdir <outputDir> <inputPath>
    const userProfileDir = `/tmp/LibreOffice_Conversion_${path.basename(inputPath)}`;
    const args = [
      `-env:UserInstallation=file://${userProfileDir}`,
      "--headless",
      "--infilter=writer_pdf_import",
      "--convert-to",
      "docx",
      "--outdir",
      outputDir,
      inputPath,
    ];

    execFile("soffice", args, { timeout }, (error) => {
      if (error) {
        // Check for timeout
        if (error instanceof Error && "signal" in error && error.signal === "SIGTERM") {
          return reject(new Error("Conversion timed out"));
        }
        return reject(error);
      }

      // LibreOffice usually names the output file same as input but with .docx extension
      const filename = path.basename(inputPath, path.extname(inputPath));
      const expectedOutputPath = path.join(outputDir, `${filename}.docx`);
      resolve(expectedOutputPath);
    });
  });
}
