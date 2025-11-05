"use server";

import { createClient } from "@/utils/supabase/server";

export const getDeadline = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deadline, error } = await supabase
    .from("deadline")
    .select("acceptResponses")
    .single();

  if (error) {
    return { error: error.message };
  }

  return deadline.acceptResponses;
};
