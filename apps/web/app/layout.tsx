import { Fragment } from "react";
import parse from "html-react-parser";
import { DM_Sans, Fredoka } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@workspace/ui/components/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/modules/common/ui/components/providers";
import { connectToDatabase, GlobalScriptModel } from "@workspace/database";
import "@workspace/ui/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["300", "400", "500", "600", "700"],
});

async function getScripts() {
  try {
    await connectToDatabase();
    return await GlobalScriptModel.find({ isActive: true }).lean();
  } catch (error) {
    console.error("Failed to fetch global scripts:", error);
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const scripts = await getScripts();
  const headScripts = scripts.filter((s) => s.location === "HEAD");
  const bodyScripts = scripts.filter((s) => s.location === "BODY");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {headScripts.map((script) => (
          <Fragment key={script._id.toString()}>{parse(script.content)}</Fragment>
        ))}
      </head>
      <body className={`${dmSans.className} ${fredoka.variable} antialiased `}>
        <Providers>
          {children}
          <Toaster closeButton />
          <Analytics />
          <SpeedInsights />
        </Providers>
        {bodyScripts.map((script) => (
          <Fragment key={script._id.toString()}>{parse(script.content)}</Fragment>
        ))}
      </body>
    </html>
  );
}
