import { cache } from "react";
import SuperJSON from "superjson";
import { headers } from "next/headers";
import { initTRPC, TRPCError } from "@trpc/server";
import { connectToDatabase } from "@workspace/database";
import { auth } from "@/lib/auth";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  await connectToDatabase();
  const heads = new Headers(await headers());
  const session = await auth.api.getSession({
    headers: heads,
  });

  return {
    session: session?.session,
    user: session?.user,
  };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: SuperJSON,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      // infers the `session` as non-nullable
      session: ctx.session,
      user: ctx.user,
    },
  });
});
