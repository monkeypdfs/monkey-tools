import Link from "next/link";
import { caller } from "@/trpc/server";
import type { IconName } from "lucide-react/dynamic";
import { SearchBar } from "@/modules/common/ui/components/search-bar";
import { FileText, ArrowRight, Users, File, Wrench } from "lucide-react";
import { DynamicIcon } from "@/modules/common/ui/components/dynamic-icon";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";

export const HeroSection = async () => {
  const categories = await caller.categories.getMany({});

  const stats = [
    { value: "1m", label: "Active Users", icon: Users },
    { value: "10m", label: "Files Converted", icon: File },
    { value: "30+", label: "Online Tools", icon: Wrench },
    { value: "500k", label: "PDFs Created", icon: FileText },
  ];

  return (
    <section className="relative w-full py-10 overflow-hidden md:py-14 bg-background text-foreground">
      {/* Background Elements */}
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
            Free Tools to Make{" "}
            <span className="inline-block px-2 py-1 text-white transform rounded-md bg-rose-500 -rotate-1">Your Life</span> Simple
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            We offer PDF, text, image and other online tools to make your life easier
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar />

        {/* Tools section */}
        <div className="grid grid-cols-1 gap-6 mb-2 md:grid-cols-2 lg:grid-cols-4">
          {categories.items.map((category) => (
            <Link
              key={category._id}
              href={`/tools/${category.slug}`}
              className="relative flex flex-col h-48 overflow-hidden transition-shadow duration-300 rounded-lg shadow-md group hover:shadow-lg"
            >
              {/* Top Colored Section */}
              <div
                style={{ backgroundColor: category.color }}
                className={`p-5 text-white flex-1 flex flex-col justify-between relative`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <DynamicIcon name={category.icon as IconName} className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm">
                    {category.toolsCount} Tools
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold">{category.name}</h3>
                  <p className="text-xs text-white/80">{category.description}</p>
                </div>

                <ArrowRight className="absolute w-5 h-5 text-white transition-opacity duration-300 opacity-0 bottom-5 right-5 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="pt-8 rounded-2xl md:pt-12 bg-linear-to-br from-background to-muted/10">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center p-4">
                <stat.icon className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="mb-2 text-4xl font-bold text-foreground md:text-5xl">{stat.value}</span>
                <span className="font-medium text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
