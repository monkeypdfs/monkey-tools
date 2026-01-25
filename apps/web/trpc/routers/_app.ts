import { createTRPCRouter } from "@/trpc/init";
import { toolsRouter } from "@/trpc/routers/toolsRouter";
import { jobsRouter } from "@/trpc/routers/jobsRouter";
import { categoriesRouter } from "@/trpc/routers/categoriesRouter";
import { pagesRouter } from "@/trpc/routers/pagesRouter";
import { globalScriptsRouter } from "@/trpc/routers/globalScriptsRouter";

export const appRouter = createTRPCRouter({
  jobs: jobsRouter,
  tools: toolsRouter,
  categories: categoriesRouter,
  pages: pagesRouter,
  globalScripts: globalScriptsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
