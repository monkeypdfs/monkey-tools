import { requireAuth } from "@/lib/auth-utils";
import { EditScriptView } from "@/modules/dashboard/ui/views/edit-script-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditScriptPage({ params }: Props) {
  await requireAuth();
  const { id } = await params;
  return <EditScriptView id={id} />;
}
