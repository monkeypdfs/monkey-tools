import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PageModel } from "@workspace/database";
import { PageType } from "@workspace/types";
import { baseProcedure, protectedProcedure, createTRPCRouter } from "../init";

// Input schemas
const getBySlugSchema = z.object({
  slug: z.string().min(1),
});

const getByIdSchema = z.object({
  id: z.string().min(1),
});

const updateHomepageSchema = z.object({
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  seoKeywords: z.string(),
  heroSection: z.object({
    badge: z.string().min(1),
    heading: z.string().min(1),
    description: z.string().min(1),
    primaryButtonText: z.string().min(1),
    primaryButtonLink: z.string().min(1),
    secondaryButtonText: z.string().min(1),
    secondaryButtonLink: z.string().min(1),
  }),
  howItWorksSection: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    steps: z
      .array(
        z.object({
          iconName: z.string().min(1),
          title: z.string().min(1),
          description: z.string().min(1),
          order: z.number(),
        }),
      )
      .min(1),
  }),
  isActive: z.boolean(),
});

const updateAllToolsPageSchema = z.object({
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  seoKeywords: z.string(),
  h1Heading: z.string().min(1),
  shortDescription: z.string().min(1),
  isActive: z.boolean(),
});

const createCustomPageSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  seoKeywords: z.string(),
  content: z.string().min(1),
  showInFooter: z.boolean().default(true),
  footerOrder: z.number().default(0),
  footerLabel: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateCustomPageSchema = createCustomPageSchema.extend({
  id: z.string().min(1),
});

const deleteCustomPageSchema = z.object({
  id: z.string().min(1),
});

export const pagesRouter = createTRPCRouter({
  // Public procedures (Frontend)
  getBySlug: baseProcedure.input(getBySlugSchema).query(async ({ input }) => {
    const page = await PageModel.findOne({ slug: input.slug, isActive: true }).lean();

    if (!page) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Page not found",
      });
    }

    return {
      ...page,
      _id: page._id.toString(),
    };
  }),

  getHomepage: baseProcedure.query(async () => {
    const page = await PageModel.findOne({ pageType: PageType.HOMEPAGE }).lean();

    if (!page) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Homepage not found",
      });
    }

    return {
      ...page,
      _id: page._id.toString(),
    };
  }),

  getAllToolsPage: baseProcedure.query(async () => {
    const page = await PageModel.findOne({ pageType: PageType.ALL_TOOLS }).lean();

    if (!page) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "All Tools page not found",
      });
    }

    return {
      ...page,
      _id: page._id.toString(),
    };
  }),

  getFooterPages: baseProcedure.query(async () => {
    const pages = await PageModel.find({
      pageType: PageType.CUSTOM,
      showInFooter: true,
      isActive: true,
    })
      .sort({ footerOrder: 1 })
      .lean();

    return pages.map((page) => ({
      ...page,
      _id: page._id.toString(),
    }));
  }),

  // Protected procedures (Dashboard)
  getAll: protectedProcedure.query(async () => {
    const pages = await PageModel.find({}).sort({ pageType: 1, footerOrder: 1 }).lean();
    return pages.map((page) => ({
      ...page,
      _id: page._id.toString(),
    }));
  }),

  getById: protectedProcedure.input(getByIdSchema).query(async ({ input }) => {
    const page = await PageModel.findById(input.id).lean();

    if (!page) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Page not found",
      });
    }

    return {
      ...page,
      _id: page._id.toString(),
    };
  }),

  updateHomepage: protectedProcedure.input(updateHomepageSchema).mutation(async ({ input }) => {
    const page = await PageModel.findOneAndUpdate(
      { pageType: PageType.HOMEPAGE },
      {
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        seoKeywords: input.seoKeywords,
        heroSection: input.heroSection,
        howItWorksSection: input.howItWorksSection,
        isActive: input.isActive,
      },
      { new: true, upsert: true, lean: true },
    );

    if (!page) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update homepage",
      });
    }

    return {
      ...page,
      _id: page._id.toString(),
    };
  }),

  updateAllToolsPage: protectedProcedure.input(updateAllToolsPageSchema).mutation(async ({ input }) => {
    const page = await PageModel.findOneAndUpdate(
      { pageType: PageType.ALL_TOOLS },
      {
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        seoKeywords: input.seoKeywords,
        h1Heading: input.h1Heading,
        shortDescription: input.shortDescription,
        isActive: input.isActive,
      },
      { new: true, upsert: true, lean: true },
    );

    if (!page) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update all tools page",
      });
    }

    return {
      ...page,
      _id: page._id.toString(),
    };
  }),

  createCustomPage: protectedProcedure.input(createCustomPageSchema).mutation(async ({ input }) => {
    // Check if slug already exists
    const existingPage = await PageModel.findOne({ slug: input.slug });
    if (existingPage) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A page with this slug already exists",
      });
    }

    const page = await PageModel.create({
      pageType: PageType.CUSTOM,
      slug: input.slug,
      title: input.title,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      seoKeywords: input.seoKeywords,
      content: input.content,
      showInFooter: input.showInFooter,
      footerOrder: input.footerOrder,
      footerLabel: input.footerLabel,
      isActive: input.isActive,
    });

    const pageObj = page.toObject();
    return {
      ...pageObj,
      _id: pageObj._id.toString(),
    };
  }),

  updateCustomPage: protectedProcedure.input(updateCustomPageSchema).mutation(async ({ input }) => {
    const page = await PageModel.findById(input.id);

    if (!page) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Page not found",
      });
    }

    if (page.pageType !== PageType.CUSTOM) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot update non-custom pages with this method",
      });
    }

    // Check if slug is being changed and if it conflicts with another page
    if (input.slug !== page.slug) {
      const existingPage = await PageModel.findOne({ slug: input.slug });
      if (existingPage) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A page with this slug already exists",
        });
      }
    }

    page.slug = input.slug;
    page.title = input.title;
    page.seoTitle = input.seoTitle;
    page.seoDescription = input.seoDescription;
    page.seoKeywords = input.seoKeywords;
    page.content = input.content;
    page.showInFooter = input.showInFooter;
    page.footerOrder = input.footerOrder;
    page.footerLabel = input.footerLabel;
    page.isActive = input.isActive;

    await page.save();

    const pageObj = page.toObject();
    return {
      ...pageObj,
      _id: pageObj._id.toString(),
    };
  }),

  deleteCustomPage: protectedProcedure.input(deleteCustomPageSchema).mutation(async ({ input }) => {
    const page = await PageModel.findById(input.id);

    if (!page) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Page not found",
      });
    }

    if (page.pageType !== PageType.CUSTOM) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot delete fixed pages (Homepage, All Tools)",
      });
    }

    await PageModel.findByIdAndDelete(input.id);

    return {
      success: true,
      message: "Custom page deleted successfully",
    };
  }),
});
