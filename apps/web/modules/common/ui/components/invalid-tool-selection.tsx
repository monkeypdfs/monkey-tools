import Link from "next/link";
import { TOOLS } from "@/modules/common/constants";
import type { IconName } from "lucide-react/dynamic";
import { Button } from "@workspace/ui/components/button";
import { DynamicIcon } from "@/modules/common/ui/components/dynamic-icon";
import { AlertTriangle, HomeIcon, SearchIcon } from "lucide-react";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";

export const InvalidToolSelection = () => {
  // Get first 3 tools as popular recommendations
  const popularTools = TOOLS.slice(0, 3);

  return (
    <section className="relative w-full overflow-hidden bg-background text-foreground">
      {/* Background Elements */}
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-orange-600 bg-orange-100 rounded-full dark:bg-orange-900/20 dark:text-orange-400">
            <AlertTriangle className="w-4 h-4" />
            Tool Not Found
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
            Oops! This Tool{" "}
            <span className="inline-block px-2 py-1 text-white transform bg-red-500 rounded-md -rotate-1">Doesn't Exist</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            The tool you're looking for might have been moved, renamed, or doesn't exist in our collection.
          </p>
        </div>

        {/* Error Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative overflow-hidden bg-white border shadow-lg dark:bg-card rounded-2xl border-border/50">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-linear-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20"></div>

            {/* Content */}
            <div className="relative p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full dark:bg-red-900/20">
                    <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="absolute flex items-center justify-center w-6 h-6 bg-red-500 rounded-full -top-1 -right-1 animate-pulse">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                </div>
              </div>

              <h2 className="mb-4 text-2xl font-bold text-foreground">What happened?</h2>
              <p className="mb-6 text-muted-foreground">
                This could be due to a typo in the URL, an outdated link, or the tool might have been temporarily removed. Don't
                worry though - we have plenty of other amazing tools for you to explore!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/">
                  <Button size="lg" className="w-full gap-2 sm:w-auto">
                    <HomeIcon className="w-4 h-4" />
                    Back to Homepage
                  </Button>
                </Link>
                <Link href="/#important-tools">
                  <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                    <SearchIcon className="w-4 h-4" />
                    Browse All Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Tools Suggestion */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-bold text-foreground">Try These Popular Tools Instead</h3>
            <p className="text-muted-foreground">Some of our most loved tools that might solve your problem</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {popularTools.map((tool) => (
              <Link key={tool.title} href={tool.link} className="group">
                <div className="p-6 transition-shadow bg-white border shadow-sm dark:bg-card rounded-xl hover:shadow-md border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg dark:bg-opacity-20 ${tool.bgColor}`}>
                      <DynamicIcon
                        name={tool.icon as IconName}
                        className={`w-5 h-5 ${tool.iconColor} dark:${tool.iconColor.replace("text-", "text-").replace("-500", "-400")}`}
                      />
                    </div>
                    <h4 className="font-semibold text-foreground">{tool.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="p-6 border bg-muted/30 rounded-2xl border-border/50">
            <h4 className="mb-2 font-semibold text-foreground">Need Help?</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              If you believe this is an error or need assistance, our support team is here to help.
            </p>
            <Link href="/contact">
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
