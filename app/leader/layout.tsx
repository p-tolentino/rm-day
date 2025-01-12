import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthCheck } from "@/components/auth/auth-check";
import { getCurrentRole, getCurrentUser } from "@/data/wholesalers";
import { getDeadline } from "@/data/deadline";
import { hasSubmittedThisMonth } from "@/data/reports";

export default async function LeaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }

  const role = await getCurrentRole();

  if (role !== "LEADER") {
    // Redirect to appropriate page based on role
    redirect("/wholesaler/profile");
  }

  const acceptReports = await getDeadline();

  const profile = await getCurrentUser();

  const hasSubmitted = await hasSubmittedThisMonth();

  return (
    <SidebarProvider>
      <AuthCheck />
      <AppSidebar
        userRole={role}
        acceptReports={acceptReports}
        user={profile}
        hasSubmitted={hasSubmitted}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
