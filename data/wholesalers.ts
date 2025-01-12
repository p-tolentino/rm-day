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
    name: `${profile.firstName} ${profile.middleName[0]}${
      profile.middleName && `.`
    } ${profile.lastName}`,
  };
};

export const getUserLocations = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: users, error } = await supabase
    .from("wholesalers")
    .select("idNum, country, city, subTeam, profession");

  if (error) {
    console.error(error.message);
    return;
  }

  return users;
};
