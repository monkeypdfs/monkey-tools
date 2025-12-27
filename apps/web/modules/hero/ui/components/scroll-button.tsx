"use client";

import { ChevronUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";

export const ScrollButton = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed z-50 bottom-8 right-8 transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      {/* Back to Top Button */}

      <Button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="p-3 text-white transition-transform bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 hover:scale-110"
        aria-label="Back to top"
      >
        <ChevronUpIcon className="w-6 h-6" />
      </Button>
    </div>
  );
};
