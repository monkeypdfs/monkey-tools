import z from "zod";
import { TRPCError } from "@trpc/server";
import { PAGINATION } from "@/modules/common/constants";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { createToolSchema } from "@/modules/dashboard/schema/tool";
import { type Category, mongoose, type Tool, ToolModel } from "@workspace/database";

export type ToolWithCategory = Tool & { category: Category };

export const toolsRouter = createTRPCRouter({
  create: protectedProcedure.input(createToolSchema).mutation(async ({ input }) => {
    try {
      const tool = new ToolModel({
        title: input.title,
        link: input.link,
        componentName: input.componentName,
        description: input.description,
        category: input.categoryId,
        icon: input.icon,
        iconColor: input.iconColor,
        bgColor: input.bgColor,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        seoKeywords: input.seoKeywords,
        h1Heading: input.h1Heading,
        introText: input.introText,
        stepsTitle: input.stepsTitle,
        visualSteps: input.visualSteps,
        richContent: input.richContent,
        faqs: input.faqs,
        closingText: input.closingText,
        isActive: input.isActive ?? true,
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

  getMany: baseProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
        categoryId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize, search, categoryId } = input;
      const searchRegex = new RegExp(search, "i");

      // Build match conditions for aggregation and count
      const baseMatch: mongoose.AnyObject = {
        title: { $regex: searchRegex },
      };

      if (!ctx.session) {
        baseMatch.isActive = true;
      }

      const aggregationMatch: mongoose.AnyObject = { ...baseMatch };
      const countMatch: mongoose.AnyObject = { ...baseMatch };

      if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
        const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
        aggregationMatch.category = categoryObjectId;
        countMatch.category = categoryObjectId;
      }

      const [items, totalCount] = await Promise.all([
        ToolModel.aggregate([
          {
            $match: aggregationMatch,
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
        ToolModel.countDocuments(countMatch),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items: items.map((tool) => ({
          ...tool,
          _id: tool._id.toString(),
          category:
            tool.category && typeof tool.category === "object" && "_id" in tool.category
              ? { ...tool.category, _id: tool.category._id?.toString() || "" }
              : null,
        })) as unknown as ToolWithCategory[],
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
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
        // Prepare update data, mapping categoryId to category
        const { categoryId, ...updateData } = input.data;
        const finalUpdateData = { ...updateData } as Omit<typeof updateData, "categoryId"> & { category?: string };

        if (categoryId !== undefined) {
          finalUpdateData.category = categoryId;
        }

        const updatedTool = await ToolModel.findByIdAndUpdate(
          input.id,
          { $set: finalUpdateData },
          {
            new: true,
            runValidators: true,
          },
        ).lean();

        if (!updatedTool) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tool not found",
          });
        }

        return {
          ...updatedTool,
          _id: updatedTool._id.toString(),
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
