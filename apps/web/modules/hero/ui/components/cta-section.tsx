import { Button } from "@workspace/ui/components/button";
import { LaptopIllustration } from "@/modules/hero/ui/components/laptop-illustration";
import { Crown, InfinityIcon, Clock, FileText, Video, ImageIcon, ScanText } from "lucide-react";

export const CtaSection = () => {
  return (
    <section className="w-full py-12 overflow-hidden bg-blue-600 dark:bg-blue-900 md:py-20">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row md:gap-12">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <h2 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">Get more with Premium</h2>
            <p className="mb-8 text-base leading-relaxed text-blue-50 dark:text-blue-200 md:text-lg">
              Take your projects further with premium tools that stay out of your way and work smarter. Create without limits,
              ads, or roadblocks. Get started for just €6.99 a month.
            </p>

            <div className="flex justify-center gap-4 mb-8 flex-nowrap lg:justify-start md:gap-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/50 backdrop-blur-sm">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-white md:text-base">Ad-free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/50 backdrop-blur-sm">
                  <InfinityIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-white md:text-base">Unlimited usage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/50 backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-white md:text-base">Faster processing</span>
              </div>
            </div>

            <Button className="h-auto px-8 py-3 text-lg font-bold text-blue-600 transition-all bg-white shadow-xl rounded-xl hover:bg-blue-50 hover:scale-105 hover:shadow-2xl">
              Get started
            </Button>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative flex justify-center flex-1 w-full max-w-lg lg:max-w-xl">
            {/* Background Arcs - Concentric Circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute -translate-x-1/2 -translate-y-1/2 border rounded-full w-96 h-96 border-white/10 top-1/2 left-1/2" />
              <div className="absolute -translate-x-1/2 -translate-y-1/2 border rounded-full w-120 h-120 border-white/10 top-1/2 left-1/2" />
              <div className="absolute -translate-x-1/2 -translate-y-1/2 border rounded-full w-160 h-160 border-white/5 top-1/2 left-1/2" />
            </div>

            {/* Laptop Composition */}
            <div className="relative z-10 w-full">
              <LaptopIllustration />

              {/* Floating Icons - Positioned absolutely relative to the container */}
              <div className="absolute -top-6 -left-2 p-2.5 bg-white rounded-xl shadow-xl animate-[bounce_3s_infinite] md:-top-8 md:-left-8 md:p-3 md:rounded-2xl">
                <FileText className="w-6 h-6 text-red-500 md:w-8 md:h-8" />
              </div>
              <div className="absolute top-1/4 -right-3 p-2.5 bg-white rounded-xl shadow-xl animate-[bounce_4s_infinite] delay-700 md:-right-12 md:p-3 md:rounded-2xl">
                <ImageIcon className="w-6 h-6 text-blue-500 md:w-8 md:h-8" />
              </div>
              <div className="absolute -bottom-2 -right-1 p-2.5 bg-white rounded-xl shadow-xl animate-[bounce_5s_infinite] delay-1000 md:-bottom-4 md:-right-4 md:p-3 md:rounded-2xl">
                <Video className="w-6 h-6 text-purple-500 md:w-8 md:h-8" />
              </div>
              <div className="absolute bottom-1/3 -left-3 p-2.5 bg-white rounded-xl shadow-xl animate-[bounce_3.5s_infinite] delay-500 md:-left-12 md:p-3 md:rounded-2xl">
                <ScanText className="w-6 h-6 text-orange-500 md:w-8 md:h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
