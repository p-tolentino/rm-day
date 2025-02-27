import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
// import { Toaster } from "sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { ImpersonationButton } from "@/components/auth/return-to-admin";

export const metadata: Metadata = {
  title: "RM Day Submissions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const cookieStore = cookies();

  // Get the current session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the admin's email from the cookie
  const adminEmail = cookieStore.get("adminEmail")?.value;

  // Check if the current session belongs to an impersonated user
  const isImpersonating = adminEmail && user?.email !== adminEmail;

  return (
    <html lang="en">
      <body className="antialiased">
        {/* <TooltipProvider>
          {children}
          {isImpersonating && <ImpersonationButton />}
          <Toaster richColors />
        </TooltipProvider> */}
      </body>
    </html>
  );
}
