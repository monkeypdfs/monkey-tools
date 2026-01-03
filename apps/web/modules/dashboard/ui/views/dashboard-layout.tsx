import { SiteHeader } from "@/modules/dashboard/ui/components/site-header";
import { AppSidebar } from "@/modules/dashboard/ui/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};
