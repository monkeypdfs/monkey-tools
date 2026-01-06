import { useQueryStates } from "nuqs";
import { toolsParams } from "@/modules/dashboard/tool-params";

export const useToolsParams = () => {
  return useQueryStates(toolsParams);
};
