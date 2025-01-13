"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function login(idNum: string, password: string) {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("wholesalers")
    .select("email")
    .eq("idNum", idNum)
    .single();

  if (!user) {
    console.error(`No wholesaler data found.`);
    return { success: false, message: `No wholesaler data found.` };
  }

  const { email } = user;

  const data = {
    email,
    password,
  };

  const { error: loginError } = await supabase.auth.signInWithPassword(data);

  if (loginError && loginError?.code === `invalid_credentials`) {
    const { error: signUpError } = await supabase.auth.signUp(data);

    if (signUpError) {
      if (signUpError?.code === `user_already_exists`) {
        return {
          success: false,
          message: loginError?.message || signUpError?.message,
        };
      }

      return {
        success: false,
        message: "Something went wrong",
      };
    }

    return { success: true, message: "Account registered successfully." };
  } else {
    revalidatePath("/", "layout");
    return { success: true, message: "Logged in successfully." };
  }
}

export async function changePassword(newPassword: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    revalidatePath("/change-password");
    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: "Failed to change password. Please try again.",
    };
  }
}
