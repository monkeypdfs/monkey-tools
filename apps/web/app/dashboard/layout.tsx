import { DashboardLayout } from "@/modules/dashboard/ui/views/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
