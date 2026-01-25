import { requireAuth } from "@/lib/auth-utils";
import { ScriptsView } from "@/modules/dashboard/ui/views/scripts-view";

export default async function ScriptsPage() {
  await requireAuth();
  return <ScriptsView />;
}
