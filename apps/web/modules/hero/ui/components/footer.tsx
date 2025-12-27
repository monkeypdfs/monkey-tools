import Image from "next/image";
import Link from "next/link";
import { TOOLS_CATEGORY_MAP } from "@/modules/common/constants";

export const Footer = () => {
  const aiTools = TOOLS_CATEGORY_MAP.ai.slice(0, 5);
  const pdfTools = TOOLS_CATEGORY_MAP.pdf.slice(0, 5);
  const imageTools = TOOLS_CATEGORY_MAP.image.slice(0, 5);
  const textTools = TOOLS_CATEGORY_MAP.text.slice(0, 5);

  return (
    <footer className="w-full bg-white border-t dark:bg-background border-border">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 lg:gap-6">
          {/* Brand Column */}
          <div className="xl:col-span-3 lg:col-span-4">
            <div className="flex items-center gap-0.5 mb-4">
              <div className="relative flex items-center justify-center p-1 rounded-lg w-7 h-7">
                <Image src="/monkey-logo.png" alt="Monkey Logo" fill sizes="28px" className="object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Monkey</span>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Monkey provides free online conversion, pdf, and other handy tools to help you solve problems of all types. All
              files both processed and unprocessed are deleted after 1 hour
            </p>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-1 gap-8 xl:col-span-9 lg:col-span-8 md:grid-cols-5">
            {/* Navigate */}
            <div className="md:col-span-1">
              <h3 className="mb-4 text-base font-bold text-foreground">Navigate</h3>
              <ul className="space-y-2">
                {["Home", "Privacy Policy", "TOS", "Contact", "Blog", "About"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-blue-600 hover:underline">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools - Spanning 4 columns */}
            <div className="col-span-2 md:col-span-4">
              <h3 className="mb-4 text-base font-bold text-foreground">Tools</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <ul className="space-y-2">
                  {aiTools.map((tool) => (
                    <li key={tool.title}>
                      <Link
                        href={`/tools${tool.link}`}
                        className="text-sm text-muted-foreground hover:text-blue-600 hover:underline"
                      >
                        {tool.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {pdfTools.map((tool) => (
                    <li key={tool.title}>
                      <Link
                        href={`/tools${tool.link}`}
                        className="text-sm text-muted-foreground hover:text-blue-600 hover:underline"
                      >
                        {tool.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {imageTools.map((tool) => (
                    <li key={tool.title}>
                      <Link
                        href={`/tools${tool.link}`}
                        className="text-sm text-muted-foreground hover:text-blue-600 hover:underline"
                      >
                        {tool.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {textTools.map((tool) => (
                    <li key={tool.title}>
                      <Link
                        href={`/tools${tool.link}`}
                        className="text-sm text-muted-foreground hover:text-blue-600 hover:underline"
                      >
                        {tool.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6 bg-blue-50 dark:bg-muted/30">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 mx-auto md:flex-row">
          {/* Left Side */}
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="flex items-center gap-1">
              <div className="relative flex items-center justify-center w-6 h-6 rounded">
                <Image src="/monkey-logo.png" alt="Monkey Logo" fill sizes="24px" className="object-contain" />
              </div>
              <span className="text-lg font-bold text-foreground">Monkey</span>
            </div>
            <span className="hidden text-muted-foreground md:inline">|</span>
            <span className="text-sm text-muted-foreground">Monkey platform provides tools</span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">@ 2025 Monkey. All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
