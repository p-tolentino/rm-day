import { createAdminClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseAdmin = await createAdminClient();

  // Get the admin's session
  const { data: adminSession, error: sessionError } =
    await supabaseAdmin.auth.getSession();

  if (sessionError || !adminSession?.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: adminUser } = await supabaseAdmin
    .from("wholesalers")
    .select("role")
    .eq("email", adminSession.session.user.email)
    .single();

  if (!adminUser || adminUser.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId } = await request.json();

  const { data: selectedUser } = await supabaseAdmin
    .from("wholesalers")
    .select("email")
    .eq("idNum", userId)
    .single();

  if (!selectedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Ensure the admin's email and access token are defined
  const adminEmail = adminSession.session.user.email;
  const adminAccessToken = adminSession.session.access_token;
  const adminRefreshToken = adminSession.session.refresh_token;

  if (!adminEmail || !adminAccessToken) {
    return NextResponse.json(
      { error: "Failed to retrieve admin email or access token" },
      { status: 500 }
    );
  }

  // Store the admin's email and access token in cookies
  const response = NextResponse.redirect(
    new URL("/wholesaler/profile", request.url)
  );
  response.cookies.set("adminEmail", adminEmail, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  response.cookies.set("adminAccessToken", adminAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  response.cookies.set("adminRefreshToken", adminRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  // Generate a magic link for the impersonated user
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: selectedUser.email,
    options: {
      redirectTo: "http://localhost:3000/wholesaler/profile", // Redirect to profile page
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Extract the access_token and refresh_token from the magic link
  const url = new URL(data.properties.action_link);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "Failed to extract token from magic link" },
      { status: 500 }
    );
  }

  // Sign in the impersonated user using the magic link token
  const { data: impersonatedSessionData, error: verifyError } =
    await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: "magiclink",
    });

  if (verifyError) {
    return NextResponse.json({ error: verifyError.message }, { status: 500 });
  }

  const access_token = impersonatedSessionData.session?.access_token;
  const refresh_token = impersonatedSessionData.session?.refresh_token;

  if (!access_token || !refresh_token) {
    return NextResponse.json(
      { error: "Failed to extract tokens from verify OTP magic link" },
      { status: 500 }
    );
  }

  // Set the impersonated user's session
  const { error: impersonatedSessionError } =
    await supabaseAdmin.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  if (impersonatedSessionError) {
    return NextResponse.json(
      { error: impersonatedSessionError.message },
      { status: 500 }
    );
  }

  console.log("Impersonation started for user:", userId); // Debugging
  return response;
}
