import { createTRPCRouter } from "@/trpc/init";
import { toolsRouter } from "@/trpc/routers/toolsRouter";
import { categoriesRouter } from "@/trpc/routers/categoriesRouter";

export const appRouter = createTRPCRouter({
  tools: toolsRouter,
  categories: categoriesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
