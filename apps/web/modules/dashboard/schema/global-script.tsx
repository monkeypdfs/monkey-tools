import { z } from "zod";

export const createGlobalScriptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Script content is required"),
  location: z.enum(["HEAD", "BODY"]),
  isActive: z.boolean().default(true),
});

export type CreateGlobalScriptInput = z.infer<typeof createGlobalScriptSchema>;
