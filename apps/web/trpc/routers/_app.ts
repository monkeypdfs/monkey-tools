import { createTRPCRouter } from "@/trpc/init";
import { toolsRouter } from "@/trpc/routers/toolsRouter";

export const appRouter = createTRPCRouter({
  tools: toolsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
