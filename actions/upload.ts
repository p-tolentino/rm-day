"use server";

import { createClient } from "@/utils/supabase/server";

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided", url: "" };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return { error: "Failed to upload avatar", url: "" };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Error uploading file", url: "" };
  }
}

export async function uploadFile(formData: FormData, bucket: string) {
  const supabase = await createClient();

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided", url: "" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${bucket}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { error: "Failed to upload avatar", url: "" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { url: publicUrl };
}

export async function deleteAvatar(avatarUrl: string) {
  const supabase = await createClient();

  try {
    const fileName = avatarUrl.split("/").pop();
    if (!fileName) {
      throw new Error("Invalid avatar URL");
    }

    const { error } = await supabase.storage
      .from("avatars")
      .remove([`avatars/${fileName}`]);

    if (error) {
      throw error;
    }

    return { success: true, message: "Avatar deleted successfully" };
  } catch (error) {
    console.error("Delete avatar error:", error);
    return { success: false, message: "Failed to delete avatar" };
  }
}
