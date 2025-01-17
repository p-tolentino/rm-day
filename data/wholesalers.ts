"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllWholesalers() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: check if current user is admin or leader

  const { data: wholesalers, error } = await supabase
    .from("wholesalers")
    .select("*");

  if (error) {
    throw new Error(`Error fetching wholesaler data: ${error.message}`);
  }

  return wholesalers;
}

export async function getSubteamWholesalers() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: check if current user is admin or leader

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

  if (!user?.email) {
    return [];
  }

  const { data: profile } = await supabase
    .from("wholesalers")
    .select("idNum, subTeam")
    .eq("email", user.email)
    .single();

  if (!profile) {
    return [];
  }

  let subteamMembers;

  if (profile.subTeam === "SUPERADMIN" || profile.subTeam === "ADMIN") {
    const { data: allWholesalers, error } = await supabase
      .from("wholesalers")
      .select("idNum");

    if (error || !allWholesalers) {
      console.error("Error fetching subteam members:", error);
      return [];
    }
    subteamMembers = allWholesalers;
  } else {
    const { data: teamMembers, error } = await supabase
      .from("wholesalers")
      .select("idNum")
      .eq("subTeam", profile.subTeam);

    if (error || !teamMembers) {
      console.error("Error fetching subteam members:", error);
      return [];
    }

    subteamMembers = teamMembers;
  }

  // Fetch reports for the current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("wholesalerId, createdAt")
    .gte("createdAt", new Date(currentYear, currentMonth, 1).toISOString())
    .lt("createdAt", new Date(currentYear, currentMonth + 1, 1).toISOString());

  if (reportsError) {
    console.error("Error fetching reports:", reportsError);
    return [];
  }

  // Get the idNum of members who have submitted this month
  const submittingMembers = new Set(
    reports.map((report) => report.wholesalerId)
  );

  // Filter out members who have already submitted
  const nonSubmittingMembers = subteamMembers
    .filter((member) => !submittingMembers.has(member.idNum)) // Exclude submitting members
    .filter((member) => member.idNum !== profile.idNum); // Exclude current user

  return nonSubmittingMembers.map((member) => member.idNum).sort();
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

  if (error) {
    return { error: error.message };
  }

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

  if (error) {
    return { error: error.message };
  }

  return profile;
};

export const getWholesalerName = async (idNum: string | undefined) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("wholesalers")
    .select("firstName, middleName, lastName")
    .eq("idNum", idNum)
    .single();

  if (error) {
    return { error: error.message };
  }

  return {
    name: `${profile.firstName} ${profile.middleName && profile.middleName[0]}${
      profile.middleName && `. `
    }${profile.lastName}`,
  };
};

export const getUserLocations = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: users, error } = await supabase
    .from("wholesalers")
    .select("idNum, country, city, subTeam, profession, avatar");

  if (error) {
    console.error(error.message);
    return;
  }

  return users;
};

export const getWholesalerRecords = async (idNum: string | undefined) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("wholesalers")
    .select("totalWholesale, totalIncome")
    .eq("idNum", idNum)
    .single();

  if (error) {
    return { error: error.message };
  }

  return profile;
};
