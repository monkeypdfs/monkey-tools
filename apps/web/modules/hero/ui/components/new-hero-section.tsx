import Link from "next/link";
import { Search, Gamepad2 } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

export const NewHeroSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-secondary border-primary/30">
          <Gamepad2 className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Your HQ for free tools</span>
        </div>
        <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl text-foreground">Choose your tools!</h1>
        <p className="max-w-2xl mx-auto mb-8 text-base md:text-lg text-muted-foreground">
          The best free tools for you to use safely: we delete your files as soon as you finish using the tools. You benefit
          because it's safe.
        </p>
        <div className="flex flex-col justify-center gap-4 mb-8 sm:flex-row">
          <Link href="#tools">
            <Button size="lg" className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Start now
            </Button>
          </Link>
          <Link href="/tools">
            <Button size="lg" variant="outline" className="border-muted-foreground/30 text-foreground hover:bg-secondary">
              View all tools
            </Button>
          </Link>
        </div>
        <div className="relative max-w-xl mx-auto md:hidden">
          <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-muted-foreground" />
          <Input placeholder="Search for tool..." className="h-12 pl-12 text-base bg-secondary border-border" />
        </div>
      </div>
    </section>
  );
};
