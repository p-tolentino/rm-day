import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthCheck } from "@/components/auth/auth-check";
import { getCurrentRole, getCurrentUser } from "@/data/wholesalers";
import { getDeadline } from "@/data/deadline";
import { getAllCategories, getAllProducts } from "@/data/food";
import { hasSubmittedThisMonth } from "@/data/reports";
import {
  hasNotSetupAccount,
  updateWholesalerEmail,
} from "@/actions/wholesaler";
import { UnauthorizedGate } from "@/components/auth/unauthorized-gate";
import { IncompleteSetupGate } from "@/components/auth/incomplete-setup-gate";

export default async function AdminLayout({
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
    hasSubmitted,
    incompleteAccountSetup,
  ] = await Promise.all([
    getCurrentRole(),
    getDeadline(),
    getCurrentUser(),
    getAllCategories(),
    getAllProducts(),
    hasSubmittedThisMonth(),
    hasNotSetupAccount(),
  ]);

  if (role !== "ADMIN") {
    return <UnauthorizedGate role="ADMIN" />;
  }

  if (incompleteAccountSetup) {
    return <IncompleteSetupGate />;
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
        hasSubmitted={hasSubmitted}
        incompleteAccountSetup={incompleteAccountSetup}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
