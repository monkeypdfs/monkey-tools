import z from "zod";
import { TRPCError } from "@trpc/server";
import { CategoryModel, ToolModel } from "@workspace/database";
import { PAGINATION } from "@/modules/common/constants";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { createCategorySchema } from "@/modules/dashboard/schema/category";

export const categoriesRouter = createTRPCRouter({
  create: protectedProcedure.input(createCategorySchema).mutation(async ({ input }) => {
    try {
      const category = new CategoryModel({
        name: input.name,
        slug: input.slug,
        description: input.description,
        icon: input.icon,
        color: input.color,
        isActive: true,
      });

      const savedCategory = await category.save();
      const categoryObj = savedCategory.toObject();

      return { ...categoryObj, _id: categoryObj._id.toString() };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to create category: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  getMany: baseProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize, search } = input;
      const searchRegex = new RegExp(search, "i");

      // Use aggregation pipeline for better performance - single query with join
      const isActiveFilter = ctx.session ? {} : { isActive: true };
      const matchStage = {
        name: { $regex: searchRegex },
        ...isActiveFilter,
      };

      const [items, totalCount] = await Promise.all([
        CategoryModel.aggregate([
          {
            $match: matchStage,
          },
          {
            $lookup: {
              from: "tools",
              localField: "_id",
              foreignField: "category",
              as: "tools",
            },
          },
          {
            $addFields: {
              toolsCount: { $size: "$tools" },
            },
          },
          {
            $project: {
              tools: 0, // Remove tools array, keep only count
            },
          },
          { $sort: { createdAt: 1 } },
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
        ]),
        CategoryModel.countDocuments(matchStage),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items: items.map((category) => ({
          ...category,
          _id: category._id.toString(),
        })),
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
      const category = await CategoryModel.findById(input.id).lean();
      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return {
        ...category,
        _id: category._id.toString(),
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch category: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  getCategoryWithTools: baseProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const category = await CategoryModel.findOne({ slug: input.slug }).lean();
    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Category not found",
      });
    }

    const tools = await ToolModel.find({ category: category._id, isActive: true }).lean();

    return {
      ...category,
      tools: tools.map((tool) => ({
        ...tool,
        category: tool.category.toString(),
        _id: tool._id.toString(),
      })),
      _id: category._id.toString(),
    };
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createCategorySchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const category = await CategoryModel.findById(input.id);
        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(input.id, { ...input.data }, { new: true }).lean();

        if (!updatedCategory) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update category",
          });
        }

        return {
          success: true,
          category: { ...updatedCategory, _id: updatedCategory._id.toString() },
          message: "Category updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update category: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      const category = await CategoryModel.findById(input.id);

      if (category) {
        await CategoryModel.findByIdAndDelete(input.id);
        return {
          id: category._id.toString(),
          name: category.name,
        };
      } else {
        return {
          id: input.id,
          name: "Category not found",
        };
      }
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),
});
