import z from "zod";
import { TRPCError } from "@trpc/server";
import { CategoryModel } from "@workspace/database";
import { PAGINATION } from "@/modules/common/constants";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { createCategorySchema } from "@/modules/dashboard/schema/category";

export const categoriesRouter = createTRPCRouter({
  create: protectedProcedure.input(createCategorySchema).mutation(async ({ input, ctx }) => {
    try {
      const category = new CategoryModel({
        name: input.name,
        slug: input.slug,
        description: input.description,
        icon: input.icon,
        createdBy: ctx.auth.id,
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

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      try {
        const searchRegex = new RegExp(search, "i");

        const [items, totalCount] = await Promise.all([
          CategoryModel.find({
            createdBy: ctx.auth.id,
            isActive: true,
            name: { $regex: searchRegex },
          })
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(),
          CategoryModel.countDocuments({
            createdBy: ctx.auth.id,
            isActive: true,
            name: { $regex: searchRegex },
          }),
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
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
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
        success: true,
        category: { ...category, _id: category._id.toString() },
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch category: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createCategorySchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const category = await CategoryModel.findById(input.id);
        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        // Check if user owns the category or is admin
        if (category.createdBy !== ctx.auth.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Unauthorized to update this category",
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
