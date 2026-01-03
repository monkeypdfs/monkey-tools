import z from "zod";
import { TRPCError } from "@trpc/server";
import { ToolModel } from "@workspace/database";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { createToolSchema } from "@/modules/dashboard/schema/tool";

export const toolsRouter = createTRPCRouter({
  create: protectedProcedure.input(createToolSchema).mutation(async ({ input, ctx }) => {
    try {
      const tool = new ToolModel({
        title: input.title,
        link: input.link,
        componentName: input.componentName,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        seoKeywords: input.seoKeywords,
        createdBy: ctx.auth.id,
        isActive: true,
        usageCount: 0,
      });

      const savedTool = await tool.save();

      return {
        success: true,
        tool: savedTool.toObject(),
        message: "Tool created successfully",
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to create tool: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  getAll: protectedProcedure.query(async () => {
    try {
      // Use .lean() to return plain JavaScript objects instead of Mongoose documents
      const tools = await ToolModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();

      return {
        success: true,
        tools,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch tools: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const tool = await ToolModel.findById(input.id).lean();
      if (!tool) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tool not found",
        });
      }

      return {
        success: true,
        tool,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch tool: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createToolSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const tool = await ToolModel.findById(input.id);
        if (!tool) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tool not found",
          });
        }

        // Check if user owns the tool or is admin
        if (tool.createdBy !== ctx.auth.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Unauthorized to update this tool",
          });
        }

        const updatedTool = await ToolModel.findByIdAndUpdate(input.id, { ...input.data }, { new: true }).lean();

        if (!updatedTool) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update tool",
          });
        }

        return {
          success: true,
          tool: updatedTool,
          message: "Tool updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update tool: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    try {
      const tool = await ToolModel.findById(input.id);
      if (!tool) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tool not found",
        });
      }

      // Check if user owns the tool or is admin
      if (tool.createdBy !== ctx.auth.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized to delete this tool",
        });
      }

      await ToolModel.findByIdAndDelete(input.id);

      return {
        success: true,
        message: "Tool deleted successfully",
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to delete tool: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),
});
