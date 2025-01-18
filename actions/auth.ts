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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/", "layout");
    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: "Failed to change password. Please try again.",
    };
  }
}

export async function changeEmail(newEmail: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      success: false,
      message: "User not found.",
    };
  }

  try {
    const oldEmail = user.email;

    // Store the old and new emails in the user's metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { oldEmail, newEmail },
    });

    if (metadataError) {
      console.error("Failed to store email data in metadata:", metadataError);
      return {
        success: false,
        message: "Failed to store email data.",
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail.trim().toLocaleLowerCase(),
    });

    if (updateError) {
      console.error("Email update error:", updateError);
      return {
        success: false,
        message: updateError.message,
      };
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      message:
        "A confirmation email has been sent to your new email address. Please confirm the email change.",
    };
  } catch (error) {
    console.error("Change email error:", error);
    return {
      success: false,
      message: "Failed to change password. Please try again.",
    };
  }
}

export async function recoverPassword(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);

  console.log(data);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Password recovery email sent!" };
}
