import z from "zod";
import { TRPCError } from "@trpc/server";
import { PAGINATION } from "@/modules/common/constants";
import { type Category, ToolModel } from "@workspace/database";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { createToolSchema } from "@/modules/dashboard/schema/tool";

export const toolsRouter = createTRPCRouter({
  create: protectedProcedure.input(createToolSchema).mutation(async ({ input }) => {
    try {
      const tool = new ToolModel({
        title: input.title,
        link: input.link,
        componentName: input.componentName,
        category: input.categoryId,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        seoKeywords: input.seoKeywords,
        isActive: true,
      });

      const savedTool = await tool.save();
      const toolObj = savedTool.toObject();

      return { ...toolObj, _id: toolObj._id.toString() };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to create tool: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ input }) => {
      const { page, pageSize, search } = input;

      try {
        const searchRegex = new RegExp(search, "i");

        const [items, totalCount] = await Promise.all([
          ToolModel.aggregate([
            {
              $match: {
                isActive: true,
                title: { $regex: searchRegex },
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
          ]),
          ToolModel.countDocuments({
            isActive: true,
            title: { $regex: searchRegex },
          }),
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
          items: items.map((tool) => ({
            ...tool,
            _id: tool._id.toString(),
            category: tool.category ? { ...tool.category, _id: tool.category._id.toString() } : null,
          })),
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch tools: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const tool = await ToolModel.findById(input.id).populate("category").lean();
      if (!tool) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tool not found",
        });
      }

      return {
        ...tool,
        _id: tool._id.toString(),
        category: tool.category ? { ...(tool.category as Category), _id: (tool.category as Category)?._id?.toString() } : null,
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
    .mutation(async ({ input }) => {
      try {
        const tool = await ToolModel.findById(input.id);
        if (!tool) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tool not found",
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
          tool: { ...updatedTool, _id: updatedTool._id.toString() },
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

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      const tool = await ToolModel.findById(input.id);
      if (!tool) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tool not found",
        });
      }

      await ToolModel.findByIdAndDelete(input.id);

      return {
        id: tool._id.toString(),
        title: tool.title,
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
