import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/utils/supabase/server";

export async function POST() {
  const supabaseAdmin = await createAdminClient();
  const cookieStore = cookies();

  // Restore the admin's session
  const adminAccessToken = cookieStore.get("adminAccessToken")?.value;
  const adminRefreshToken = cookieStore.get("adminRefreshToken")?.value;

  if (adminAccessToken && adminRefreshToken) {
    const { error } = await supabaseAdmin.auth.setSession({
      access_token: adminAccessToken,
      refresh_token: adminRefreshToken,
    });

    if (error) {
      console.log(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Clear the adminAccessToken cookie
  const response = NextResponse.json({ success: true });
  response.cookies.delete("adminAccessToken");
  response.cookies.delete("adminRefreshToken");
  response.cookies.delete("adminEmail");

  console.log("Impersonation canceled"); // Debugging
  return response;
}
