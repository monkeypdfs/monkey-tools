import { requireAuth } from "@/lib/auth-utils";
import { CreateCategoryView } from "@/modules/dashboard/ui/views/create-category-view";

export default async function CreateCategoryPage() {
  await requireAuth();
  return <CreateCategoryView />;
}
