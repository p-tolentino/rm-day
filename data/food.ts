"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllCategories() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: check if current user is admin or leader

  const { data: categories, error } = await supabase
    .from("categories")
    .select("name");

  if (error) {
    throw new Error(`Error fetching categories data: ${error.message}`);
  }

  return categories;
}

export async function getAllProducts() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: check if current user is admin or leader

  const { data: products, error } = await supabase.from("products").select("*");

  if (error) {
    throw new Error(`Error fetching products data: ${error.message}`);
  }

  return products;
}
