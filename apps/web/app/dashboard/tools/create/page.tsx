import { requireAuth } from "@/lib/auth-utils";
import { CreateToolView } from "@/modules/dashboard/ui/views/create-tool-view";

export default async function CreateToolPage() {
  await requireAuth();
  return <CreateToolView />;
}
