import z from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  icon: z.string().min(1, {
    message: "Icon is required.",
  }),
  color: z.string().min(4, {
    message: "Color must be a valid hex code.",
  }),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof createCategorySchema>;
