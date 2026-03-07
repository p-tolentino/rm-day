"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllWholesalers() {
  const supabase = await createClient();
  const { data: wholesalers, error } = await supabase
    .from("wholesalers")
    .select("*");
  if (error)
    throw new Error(`Error fetching wholesaler data: ${error.message}`);
  return wholesalers;
}

export async function getSubteamWholesalers() {
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

  const { data: subTeam, error } = await supabase
    .from("wholesalers")
    .select("*")
    .eq("subTeam", profile.subTeam);

  if (error) {
    console.error("Error fetching subteam data:", error.message);
    return [];
  }
  return subTeam;
}

export async function getNonSubmittingSubteamMembers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return [];

  const { data: profile } = await supabase
    .from("wholesalers")
    .select("idNum, subTeam")
    .eq("email", user.email)
    .single();

  if (!profile) return [];

  let subteamMembers;
  if (profile.subTeam === "SUPERADMIN" || profile.subTeam === "ADMIN") {
    const { data: allWholesalers, error } = await supabase
      .from("wholesalers")
      .select("idNum");
    if (error || !allWholesalers) return [];
    subteamMembers = allWholesalers;
  } else {
    const { data: teamMembers, error } = await supabase
      .from("wholesalers")
      .select("idNum")
      .eq("subTeam", profile.subTeam);
    if (error || !teamMembers) return [];
    subteamMembers = teamMembers;
  }

  // Filter at DB level — only reports from the current month
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

  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("wholesalerId")
    .gte("createdAt", monthStart)
    .lt("createdAt", monthEnd);

  if (reportsError) {
    console.error("Error fetching reports:", reportsError);
    return [];
  }

  const submittingMembers = new Set(reports.map((r) => r.wholesalerId));

  return subteamMembers
    .filter((m) => !submittingMembers.has(m.idNum) && m.idNum !== profile.idNum)
    .map((m) => m.idNum)
    .sort();
}

export const getCurrentRole = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("wholesalers")
    .select("role")
    .eq("email", user?.email)
    .single();

  if (error) return { error: error.message };
  return profile?.role;
};

export const getCurrentUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("wholesalers")
    .select("*")
    .eq("email", user?.email)
    .single();

  if (error) return { error: error.message };
  return profile;
};

export const getWholesalerName = async (idNum: string | undefined) => {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("wholesalers")
    .select("firstName, middleName, lastName")
    .eq("idNum", idNum)
    .single();

  if (error) return { error: error.message };

  return {
    name: `${profile.firstName} ${
      profile.middleName?.trim() ? `${profile.middleName[0]}. ` : ""
    }${profile.lastName}`,
  };
};

export const getUserLocations = async () => {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("wholesalers")
    .select(
      "idNum, country, city, subTeam, profession, avatar, totalWholesale, totalIncome",
    );

  if (error) {
    console.error(error.message);
    return;
  }
  return users;
};

/**
 * Returns a Map<idNum, userLocation> for O(1) lookups.
 * Use this instead of getUserLocations() when joining with reports.
 */
export const getUserLocationsMap = async () => {
  const locations = await getUserLocations();
  if (!locations) return new Map();
  return new Map(locations.map((u) => [u.idNum, u]));
};

export const getWholesalerRecords = async (idNum: string | undefined) => {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("wholesalers")
    .select("totalWholesale, totalIncome")
    .eq("idNum", idNum)
    .single();

  if (error) return { error: error.message };
  return profile;
};
