import { requireAuth } from "@/lib/auth-utils";
import { EditAllToolsPageView } from "@/modules/dashboard/ui/views/edit-all-tools-page-view";

export default async function EditAllToolsPagePage() {
  await requireAuth();
  return <EditAllToolsPageView />;
}
