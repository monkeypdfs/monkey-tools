import { requireAuth } from "@/lib/auth-utils";
import { CreateCustomPageView } from "@/modules/dashboard/ui/views/create-custom-page-view";

export default async function CreateCustomPagePage() {
  await requireAuth();
  return <CreateCustomPageView />;
}
