import { spawn } from "node:child_process";

type CompressionLevel = "screen" | "ebook" | "printer" | "prepress";

/**
 * /screen  = 72 dpi (Smallest size, lower quality)
 * /ebook   = 150 dpi (Best balance for general use)
 * /printer = 300 dpi (High quality)
 */
export async function runGhostscript(inputPath: string, outputPath: string, level: CompressionLevel = "screen"): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      `-dPDFSETTINGS=/${level}`, // The magic setting
      "-dNOPAUSE", // Don't pause between pages
      "-dQUIET", // Don't log garbage to stdout
      "-dBATCH", // Exit after processing
      `-sOutputFile=${outputPath}`,
      inputPath,
    ];

    const gs = spawn("gs", args);

    gs.on("error", (err) => reject(err));

    gs.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Ghostscript exited with code ${code}`));
    });
  });
}
