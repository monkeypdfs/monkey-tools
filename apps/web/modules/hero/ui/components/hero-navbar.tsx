"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";
import { Menu, Search, Share2, Moon, Sun, ChevronDown, FileText, ImageIcon, PenTool, BrainIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";

export const HeroNavbar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "PDF", icon: FileText },
    { label: "Image", icon: ImageIcon },
    { label: "Text", icon: PenTool },
    { label: "AI", icon: BrainIcon },
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full ${scrolled ? "border-b" : ""} bg-background transition-all duration-300`}>
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-0.5 cursor-pointer">
          {/* Placeholder Logo Icon */}
          <div className="p-0.5 rounded-lg flex items-center justify-center relative w-7 h-7">
            <Image src="/monkey-logo.png" alt="Monkey Logo" fill sizes="28px" className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-none tracking-tight">Monkey</span>
          </div>
        </Link>

        {/* Center: Desktop Nav */}
        <div className="items-center hidden gap-1 lg:flex">
          {navItems.map((item) => (
            <DropdownMenu key={item.label}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-base font-medium text-muted-foreground hover:text-foreground"
                  aria-labelledby={item.label}
                >
                  {item.label} <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
                <DropdownMenuItem>Option 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="items-center hidden gap-2 md:flex">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme((currTheme) => (currTheme === "dark" ? "light" : "dark"))}
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Share */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <div className="w-px h-6 mx-2 bg-border" />

          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search" className="border-none shadow-none pl-9 bg-muted/70 focus-visible:ring-2" />
          </div>

          {/* Sign In */}
          <Button className="px-6 ml-2 font-semibold text-white bg-blue-500 hover:bg-blue-600">Sign In</Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Theme Toggle Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme((currTheme) => (currTheme === "dark" ? "light" : "dark"))}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-1">
                  <div className="relative flex items-center justify-center p-0 rounded-lg w-7 h-7">
                    <Image src="/monkey-logo.png" alt="Monkey Logo" fill sizes="28px" className="object-contain" />
                  </div>
                  <span>Monkey</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <div className="relative w-full px-4">
                  <Search className="absolute w-4 h-4 -translate-y-1/2 left-5 top-1/2 text-muted-foreground pl-0.5" />
                  <Input type="search" placeholder="Search" className="pl-6 bg-muted/50" />
                </div>
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="justify-start h-12 text-lg font-medium"
                      aria-labelledby={item.label}
                    >
                      <item.icon className="w-5 h-5 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
                <div className="h-px my-2 bg-border" />
                <div className="px-5">
                  <Button className="w-full text-white bg-blue-500 hover:bg-blue-600">Sign In</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
