"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllReports() {
  const supabase = await createClient();
  const { data: reports, error } = await supabase.from("reports").select("*");
  if (error) throw new Error(`Error fetching reports data: ${error.message}`);
  return reports;
}

export async function getSubteamReports() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error: userError } = await supabase
    .from("wholesalers")
    .select("subTeam")
    .eq("email", user?.email)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError.message);
    return [];
  }

  // Single query: get reports for all wholesalers in this subTeam via IN subquery
  const { data: subTeamWholesalers, error: wholesalersError } = await supabase
    .from("wholesalers")
    .select("idNum")
    .eq("subTeam", profile.subTeam);

  if (wholesalersError) {
    console.error("Error fetching subteam:", wholesalersError.message);
    return [];
  }

  const wholesalerIds = subTeamWholesalers.map((w) => w.idNum);

  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .in("wholesalerId", wholesalerIds);

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

  if (!user?.email) return false;

  const { data: profile } = await supabase
    .from("wholesalers")
    .select("idNum")
    .eq("email", user.email)
    .single();

  if (!profile?.idNum) return false;

  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("wholesalerId", profile.idNum);

  if (error) throw new Error(`Error fetching reports data: ${error.message}`);
  return reports;
}

/**
 * Optimized: checks DB-level instead of fetching all reports then filtering in JS.
 */
export const hasSubmittedThisMonth = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return false;

  const { data: profile } = await supabase
    .from("wholesalers")
    .select("idNum")
    .eq("email", user.email)
    .single();

  if (!profile?.idNum) return false;

  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  ).toISOString();

  const { count, error } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("wholesalerId", profile.idNum)
    .gte("createdAt", monthStart)
    .lt("createdAt", monthEnd);

  if (error) return false;
  return (count ?? 0) > 0;
};
