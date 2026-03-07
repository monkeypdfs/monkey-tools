/**
 * Converts PascalCase icon name (e.g. from dashboard picker) to kebab-case
 * for lucide-react/dynamic (e.g. "FileText" -> "file-text").
 */
export function toLucideIconName(name: string): string {
  return name.replace(/([A-Z])/g, (_, c) => `-${c.toLowerCase()}`).replace(/^-/, "");
}
