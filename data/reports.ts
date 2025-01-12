"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllReports() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: check if current user is admin or leader

  const { data: reports, error } = await supabase.from("reports").select("*");

  if (error) {
    throw new Error(`Error fetching reports data: ${error.message}`);
  }

  return reports;
}

export async function getSubteamReports() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: check if current user is admin or leader

  // Current user's subteam
  const { data: profile, error: userError } = await supabase
    .from("wholesalers")
    .select("subTeam")
    .eq("email", user?.email)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError.message);
    return [];
  }

  const subTeam = profile.subTeam;

  // All wholesalers in the same subTeam
  const { data: subTeamWholesalers, error: wholesalersError } = await supabase
    .from("wholesalers")
    .select("idNum") // Select only the wholesaler IDs
    .eq("subTeam", subTeam);

  if (wholesalersError) {
    console.error("Error fetching subteam:", wholesalersError.message);
    return [];
  }

  // Wholesaler IDs
  const wholesalerIds = subTeamWholesalers.map(
    (wholesaler) => wholesaler.idNum
  );

  // All reports for the wholesalers in the subTeam
  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .in("wholesalerId", wholesalerIds); // Use `in` to filter by multiple wholesaler IDs

  if (reportsError) {
    console.error("Error fetching reports data:", reportsError.message);
    return [];
  }

  return reports;
}

export async function getCurrentUserReports() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return false;
  }

  const { data: profile } = await supabase
    .from("wholesalers")
    .select("idNum")
    .eq("email", user.email)
    .single();

  if (!profile?.idNum) {
    return false;
  }

  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("wholesalerId", profile?.idNum);

  if (error) {
    throw new Error(`Error fetching reports data: ${error.message}`);
  }

  return reports;
}

async function getReportsByWholesaler(wholesalerId: string) {
  const supabase = await createClient();

  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("wholesalerId", wholesalerId);

  if (error) {
    throw new Error(`Error fetching reports data: ${error.message}`);
  }

  return reports;
}

export const hasSubmittedThisMonth = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return false;
  }

  const { data: profile } = await supabase
    .from("wholesalers")
    .select("idNum")
    .eq("email", user.email)
    .single();

  if (!profile?.idNum) {
    return false;
  }

  const reports = await getReportsByWholesaler(profile.idNum);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return reports.some((report) => {
    const reportDate = new Date(report.createdAt);
    return (
      reportDate.getMonth() === currentMonth &&
      reportDate.getFullYear() === currentYear
    );
  });
};
