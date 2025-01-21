import Header from "@/components/ui/header";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import ProfilePage from "./_components/profile-component";
import { getAllWholesalers, getCurrentUser } from "@/data/wholesalers";

export const metadata: Metadata = {
  title: "User Profile",
};

export default async function UserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("User not logged in.");
    return;
  }

  const profile = await getCurrentUser();
  const wholesalers = await getAllWholesalers();

  const formattedWholesalers = wholesalers.map((wholesaler) => {
    if (profile.idNum !== wholesaler.idNum)
      return `${wholesaler.firstName} ${
        wholesaler.middleName && wholesaler.middleName.trim()
          ? `${wholesaler.middleName[0]}. `
          : ""
      }${wholesaler.lastName}`;
  });

  return (
    <>
      <Header pageTitle={metadata.title} />
      <ProfilePage profile={profile} wholesalers={formattedWholesalers} />
    </>
  );
}
