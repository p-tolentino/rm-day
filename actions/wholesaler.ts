"use server";

import * as z from "zod";

import { registerSchema } from "@/components/auth/register-wholesaler";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { editProfileSchema } from "@/app/wholesaler/profile/_components/edit-profile";

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
    // dob,
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
    // dob: formatDate(dob),
    email: email.trim().toLocaleLowerCase(),
    idNum: cleanText(idNum),
    firstName: cleanText(firstName),
    middleName: middleName ? cleanText(middleName) : " ",
    lastName: cleanText(lastName),
    country: location && location[0],
    city: location && location[1],
    profession: cleanText(profession),
    sponsor,
    subTeam,
    avatar,
    createdBy: currentUser
      ? `${currentUser.firstName} ${
          currentUser.middleName && currentUser.middleName[0]
        }${currentUser.middleName && `. `}${currentUser.lastName}`
      : null,
  });

  if (error) {
    console.log(error);

    if (error.details.includes("already exists")) {
      return {
        success: false,
        message: "ID Number is already registered.",
        data,
      };
    }
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
  values: z.infer<typeof editProfileSchema>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   return { success: false, message: "User is not logged in." };
  // }

  const {
    // dob,
    idNum,
    firstName,
    lastName,
    location,
    middleName,
    profession,
    sponsor,
  } = values;

  const { data, error } = await supabase
    .from("wholesalers")
    .update({
      // dob: formatDate(dob),
      firstName: cleanText(firstName),
      middleName: middleName ? cleanText(middleName) : " ",
      lastName: cleanText(lastName),
      country: location[0],
      city: location[1],
      profession: cleanText(profession),
      sponsor,
    })
    .eq("idNum", idNum);

  if (error) {
    console.log(error);
    return { success: false, message: error.message };
  }

  revalidatePath("/wholesaler/profile");

  return {
    success: true,
    message: "Profile updated successfully.",
    data,
  };
}

export async function updateWholesalerEmail() {
  const supabase = await createClient();

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // Retrieve the old and new emails from the user's metadata
    const oldEmail = user.user_metadata?.oldEmail;
    const newEmail = user.user_metadata?.newEmail;

    if (!oldEmail || !newEmail || newEmail !== user.email) {
      return {
        success: false,
        message: "Email data not found or mismatch.",
      };
    }

    // Update the `wholesalers` table using the old email
    const { error } = await supabase
      .from("wholesalers")
      .update({ email: newEmail })
      .eq("email", oldEmail);

    if (error) {
      console.error("Failed to update email in wholesalers table:", error);
      return {
        success: false,
        message: "Failed to update your email in the database.",
      };
    }

    // Clear the stored emails from metadata
    await supabase.auth.updateUser({
      data: { oldEmail: null, newEmail: null },
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Your email has been updated successfully.",
    };
  } catch (error) {
    console.error("Update wholesalers email error:", error);
    return {
      success: false,
      message: "Failed to update email. Please try again.",
    };
  }
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

export async function updateWholesalerId(currentId: string, newId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wholesalers")
    .update({ idNum: newId })
    .eq("idNum", currentId);

  if (error) {
    console.error("Error updating wholesaler ID:", error.message);
    return { success: false, message: error.message };
  }

  const { error: updateReports } = await supabase
    .from("reports")
    .update({ wholesalerId: newId })
    .eq("wholesalerId", currentId);

  if (updateReports) {
    console.error("Error updating wholesaler report:", updateReports.message);
  }

  revalidatePath("/admin/wholesalers");

  return {
    success: true,
    message: "Wholesaler ID updated successfully for:",
    data,
  };
}

export async function deleteWholesaler(wholesalerId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { error: deleteError } = await supabase
      .from("wholesalers")
      .delete()
      .eq("id", wholesalerId);

    if (deleteError) {
      return { success: false, message: deleteError.message };
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "User deleted successfully.",
    };
  } catch (error) {
    console.error(`Delete user error:`, error);
    return { success: false, message: `Failed to delete user` };
  }
}

export async function hasNotSetupAccount() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   return { message: "User is not logged in." };
  // }

  const { data: currentUser } = await supabase
    .from("wholesalers")
    .select("*")
    .eq("email", user?.email)
    .single();

  const { subTeam, sponsor, country, profession } = currentUser;

  const noAccount = !subTeam || !sponsor || !country || !profession;

  return noAccount;
}
