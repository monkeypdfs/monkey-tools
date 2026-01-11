import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { AlertTriangle, HomeIcon, SearchIcon } from "lucide-react";

export const InvalidToolSelection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-secondary border-primary/30">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Tool Not Found</span>
          </div>

          <h1 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl text-foreground">
            Oops! This Tool{" "}
            <span className="inline-block px-2 py-1 rounded-md text-primary-foreground bg-primary">Doesn't Exist</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            The tool you're looking for might have been moved, renamed, or doesn't exist in our collection.
          </p>
        </div>

        {/* Error Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="p-8 border rounded-2xl bg-card border-border/50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 border rounded-full bg-secondary border-primary/20">
                <AlertTriangle className="w-8 h-8 text-primary" />
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
                <Link href="/#tools">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 sm:w-auto border-muted-foreground/30 text-foreground hover:bg-secondary"
                  >
                    <SearchIcon className="w-4 h-4" />
                    Browse All Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="p-6 border rounded-2xl bg-card border-border/50">
            <div className="text-center">
              <h4 className="mb-2 font-semibold text-foreground">Need Help?</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                If you believe this is an error or need assistance, our support team is here to help.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="border-muted-foreground/30 text-foreground hover:bg-secondary">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
