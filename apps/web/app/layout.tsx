import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@workspace/ui/components/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/modules/common/ui/components/providers";
import "@workspace/ui/globals.css";
import "react-image-crop/dist/ReactCrop.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased `}>
        <Providers>
          {children}
          <Toaster closeButton />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
