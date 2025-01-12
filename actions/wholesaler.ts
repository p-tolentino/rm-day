"use server";

import * as z from "zod";

import { registerSchema } from "@/components/auth/register-wholesaler";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentRole } from "@/data/wholesalers";

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
    dob: new Date(dob),
    email: email.toLocaleLowerCase(),
    idNum,
    firstName: firstName.toLocaleUpperCase(),
    middleName: middleName?.toLocaleUpperCase(),
    lastName: lastName.toLocaleUpperCase(),
    country: location[0],
    city: location[1],
    profession: profession.toLocaleUpperCase(),
    sponsor,
    subTeam,
    avatar,
    createdBy: `${currentUser?.firstName} ${currentUser?.middleName[0]}. ${currentUser?.lastName}`,
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
