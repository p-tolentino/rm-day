"use server";

import * as z from "zod";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentRole } from "@/data/wholesalers";
import { categorySchema } from "@/components/food/category-form";
import { productSchema } from "@/components/food/product-form";
import { formatCamelCase } from "@/components/ui/location-input";

export async function createCategory(values: z.infer<typeof categorySchema>) {
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

  const { name } = values;

  const { data, error } = await supabase.from("categories").insert({
    name: name.toLocaleUpperCase(),
  });

  if (error) {
    return { success: false, message: error.message, data };
  }

  revalidatePath("/", "layout");

  return { success: true, message: "Category created successfully.", data };
}

export async function createProduct(values: z.infer<typeof productSchema>) {
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

  const { category, name, points } = values;

  const { data, error } = await supabase.from("products").insert({
    category,
    name: formatCamelCase(name),
    points,
  });

  if (error) {
    return { success: false, message: error.message, data };
  }

  revalidatePath("/admin/food-dropship");

  return { success: true, message: "Product created successfully.", data };
}
