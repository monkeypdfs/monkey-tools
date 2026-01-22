import { requireUnauth } from "@/lib/auth-utils";
import { LoginView } from "@/modules/auth/ui/views/login-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login - Monkey Tools",
  description: "Secure login for Monkey Tools administrators.",
};

export default async function Page() {
  await requireUnauth();
  return <LoginView />;
}
