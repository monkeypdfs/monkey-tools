import { createLoader } from "nuqs/server";
import { toolsParams } from "@/modules/dashboard/tool-params";
import { categoriesParams } from "@/modules/dashboard/category-params";

export const toolsParamsLoader = createLoader(toolsParams);
export const categoriesParamsLoader = createLoader(categoriesParams);
