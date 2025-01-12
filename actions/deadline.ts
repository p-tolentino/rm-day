"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDeadline(value: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   return { message: "User is not logged in." };
  // }

  // const currentRole = await getCurrentRole();
  // const isAuthorized = currentRole === "ADMIN" || currentRole === "LEADER"

  // if (!isAuthorized) {
  //   return { message: "Unauthorized: Only admins or leaders can register wholesalers."};
  // }

  const { data, error } = await supabase
    .from("deadline")
    .update({ acceptResponses: value })
    .eq("id", 1)
    .select();

  if (error) {
    console.log(error);
    return { success: false };
  }

  revalidatePath(`/`, "layout");
  return { success: true };
}
