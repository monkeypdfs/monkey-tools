import { requireAuth } from "@/lib/auth-utils";
import { CreateScriptView } from "@/modules/dashboard/ui/views/create-script-view";

export default async function CreateScriptPage() {
  await requireAuth();
  return <CreateScriptView />;
}
