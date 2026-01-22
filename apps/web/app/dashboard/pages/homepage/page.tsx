import { requireAuth } from "@/lib/auth-utils";
import { EditHomepageView } from "@/modules/dashboard/ui/views/edit-homepage-view";

export default async function EditHomepagePage() {
  await requireAuth();
  return <EditHomepageView />;
}
