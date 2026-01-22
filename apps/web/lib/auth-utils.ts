import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getAuthSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const requireAuth = async () => {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return session;
};

export const requireUnauth = async () => {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  }
};
