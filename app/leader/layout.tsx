import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthCheck } from "@/components/auth/auth-check";
import { getCurrentRole, getCurrentUser } from "@/data/wholesalers";
import { getDeadline } from "@/data/deadline";
// import { hasSubmittedThisMonth } from "@/data/reports";
import {
  hasNotSetupAccount,
  updateWholesalerEmail,
} from "@/actions/wholesaler";
import { getAllCategories, getAllProducts } from "@/data/food";
import { UnauthorizedGate } from "@/components/auth/unauthorized-gate";
import { IncompleteSetupGate } from "@/components/auth/incomplete-setup-gate";
import MaintenanceGate from "@/components/auth/maintenance-gate";

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

  const updateResult = await updateWholesalerEmail();
  if (!updateResult.success) {
    console.error(updateResult.message);
  }

  const [
    role,
    acceptReports,
    profile,
    categories,
    products,
    // hasSubmitted,
    incompleteAccountSetup,
  ] = await Promise.all([
    getCurrentRole(),
    getDeadline(),
    getCurrentUser(),
    getAllCategories(),
    getAllProducts(),
    // hasSubmittedThisMonth(),
    hasNotSetupAccount(),
  ]);

  if (role !== "LEADER") {
    return <UnauthorizedGate role="LEADER" />;
  }

  if (incompleteAccountSetup) {
    return <IncompleteSetupGate />;
  }

  if (process.env.MAINTENANCE_MODE === "true" && role === "LEADER") {
    return <MaintenanceGate />;
  }

  return (
    <SidebarProvider>
      <AuthCheck />
      <AppSidebar
        userRole={role}
        acceptReports={acceptReports}
        user={profile}
        products={products}
        categories={categories}
        hasSubmitted={false}
        incompleteAccountSetup={incompleteAccountSetup}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
