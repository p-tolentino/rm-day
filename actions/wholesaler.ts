"use server";

import * as z from "zod";

import { registerSchema } from "@/components/auth/register-wholesaler";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const cleanText = (text: string | null | undefined): string => {
  return (text || "").trim().toLocaleUpperCase();
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export async function registerWholesalerInfo(
  values: z.infer<typeof registerSchema>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   return { message: "User is not logged in." };
  // }

  const { data: currentUser } = await supabase
    .from("wholesalers")
    .select("firstName, middleName, lastName")
    .eq("email", user?.email)
    .single();

  // const currentRole = await getCurrentRole();
  // const isAuthorized = currentRole === "ADMIN" || currentRole === "LEADER"

  // if (!isAuthorized) {
  //   return { message: "Unauthorized: Only admins or leaders can register wholesalers."};
  // }

  const {
    dob,
    email,
    firstName,
    idNum,
    lastName,
    location,
    middleName,
    profession,
    sponsor,
    subTeam,
    avatar,
  } = values;

  const { data, error } = await supabase.from("wholesalers").insert({
    dob: formatDate(dob),
    email: email.trim().toLocaleLowerCase(),
    idNum: idNum.trim(),
    firstName: cleanText(firstName),
    middleName: middleName ? cleanText(middleName) : null,
    lastName: cleanText(lastName),
    country: location[0],
    city: location[1],
    profession: cleanText(profession),
    sponsor,
    subTeam,
    avatar,
    createdBy: currentUser
      ? `${cleanText(currentUser.firstName)} ${
          cleanText(currentUser.middleName)?.[0] || ""
        }.${currentUser.middleName?.[0] ? " " : ""}${cleanText(
          currentUser.lastName
        )}`
      : null,
  });

  if (error) {
    return { success: false, message: error.message, data };
  }

  revalidatePath("/admin/wholesalers");

  return {
    success: true,
    message: "Wholesaler information registered successfully.",
    data,
  };
}

export async function updateWholesalerInfo(
  values: z.infer<typeof registerSchema>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User is not logged in." };
  }

  const {
    dob,
    email,
    firstName,
    idNum,
    lastName,
    location,
    middleName,
    profession,
    sponsor,
    subTeam,
    avatar,
  } = values;

  const { data, error } = await supabase
    .from("wholesalers")
    .update({
      dob: formatDate(dob),
      email: email.trim().toLocaleLowerCase(),
      firstName: cleanText(firstName),
      middleName: middleName ? cleanText(middleName) : null,
      lastName: cleanText(lastName),
      country: location[0],
      city: location[1],
      profession: cleanText(profession),
      sponsor,
      subTeam,
      avatar,
    })
    .eq("idNum", idNum);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/wholesaler/profile");

  return {
    success: true,
    message: "Profile updated successfully.",
    data,
  };
}

export async function updateUserRole(wholesalerId: string, newRole: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wholesalers")
    .update({ role: newRole })
    .eq("idNum", wholesalerId);

  if (error) {
    console.error("Error updating user role:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/wholesalers");

  return {
    success: true,
    message: "Role updated successfully.",
    data,
  };
}

export async function updateWholesalerAvatar(idNum: string, avatarUrl: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("wholesalers")
      .update({ avatar: avatarUrl })
      .eq("idNum", idNum)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/wholesalers");
    revalidatePath("/wholesaler/profile");

    return {
      success: true,
      message: "Avatar updated successfully",
      data,
    };
  } catch (error) {
    console.error("Avatar update error:", error);
    return {
      success: false,
      message: "Failed to update avatar",
    };
  }
}
