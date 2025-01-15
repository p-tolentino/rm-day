import Header from "@/components/ui/header";
import { SubteamDataTable } from "./_components/subteam-table";
import type { Metadata } from "next";
import {
  getAllWholesalers,
  getCurrentRole,
  getSubteamWholesalers,
  getUserLocations,
} from "@/data/wholesalers";

export const metadata: Metadata = {
  title: "Subteam Database",
};
export default async function WholesalerData() {
  // TODO: FIX TYPE SAFETY

  const wholesalers = await getAllWholesalers();
  const subteam = await getSubteamWholesalers();
  const userLocations = await getUserLocations();

  const role = await getCurrentRole();

  const formattedWholesalers = wholesalers.map((wholesaler) => {
    return `${wholesaler.firstName} ${
      wholesaler.middleName && wholesaler.middleName[0]
    }${wholesaler.middleName && `. `}${wholesaler.lastName}`;
  });

  return (
    <>
      <Header
        pageTitle={`${metadata.title} (${subteam[0].subTeam})`}
        wholesalers={formattedWholesalers}
        role={role}
      />
      <div className="container mx-auto py-10">
        <SubteamDataTable data={subteam} userLocations={userLocations} />
      </div>
    </>
  );
}
